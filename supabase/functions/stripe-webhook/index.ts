
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from 'https://esm.sh/stripe@14.21.0';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.3';

const STRIPE_SECRET_KEY = Deno.env.get('STRIPE_SECRET_KEY') || '';
const STRIPE_WEBHOOK_SECRET = Deno.env.get('STRIPE_WEBHOOK_SECRET') || '';

serve(async (req) => {
  const stripe = new Stripe(STRIPE_SECRET_KEY, {
    apiVersion: '2023-10-16',
  });
  
  // Initialize Supabase client
  const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
  const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY') || '';
  const supabaseClient = createClient(supabaseUrl, supabaseKey);

  try {
    // Get the signature from the header
    const signature = req.headers.get('stripe-signature');
    if (!signature) {
      return new Response(JSON.stringify({ error: 'No signature provided' }), { status: 400 });
    }

    // Get the raw request body
    const body = await req.text();
    
    // Verify the event
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      STRIPE_WEBHOOK_SECRET
    );

    console.log(`Processing Stripe event: ${event.type}`);
    
    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const userId = session.metadata?.user_id;
        
        if (!userId) {
          console.error('No user ID in session metadata');
          break;
        }
        
        // Update user's subscription
        await supabaseClient
          .from('user_subscriptions')
          .upsert({
            user_id: userId,
            plan: 'pro',
            stripe_session_id: session.id,
            stripe_customer_id: session.customer,
            payment_status: 'completed',
            updated_at: new Date().toISOString(),
          }, {
            onConflict: 'user_id',
          });
          
        console.log(`User ${userId} successfully upgraded to Pro!`);
        break;
      }
      
      case 'charge.succeeded': {
        const charge = event.data.object;
        const session = await stripe.checkout.sessions.retrieve(charge.metadata?.session_id);
        const userId = session.metadata?.user_id;
        
        if (userId) {
          // Additional logging for successful charge
          console.log(`Payment successfully processed for user ${userId}`);
        }
        break;
      }
    }

    // Return a 200 response
    return new Response(JSON.stringify({ received: true }), { status: 200 });
    
  } catch (error) {
    console.error('Error processing webhook:', error);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400 }
    );
  }
});
