
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@12.18.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: corsHeaders,
      status: 200,
    });
  }

  try {
    // Get the request body
    const body = await req.text();
    
    // Get the signature from the headers
    const signature = req.headers.get('stripe-signature');
    if (!signature) {
      throw new Error('No Stripe signature found');
    }

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
      httpClient: Stripe.createFetchHttpClient(),
    });

    // Verify the event
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      Deno.env.get('STRIPE_WEBHOOK_SECRET') || ''
    );

    // Create a Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') || '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
    );

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        
        // Check if this is a subscription checkout
        if (session.mode === 'subscription') {
          await handleSubscriptionCheckout(session, supabaseClient);
        }
        break;
      }
      
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        await handleSubscriptionChange(subscription, supabaseClient);
        break;
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});

// Handle subscription checkout
async function handleSubscriptionCheckout(session: any, supabaseClient: any) {
  // Get the subscription from Stripe
  const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
    httpClient: Stripe.createFetchHttpClient(),
  });
  
  // Get user ID from subscription metadata
  const subscriptionId = session.subscription;
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  const userId = subscription.metadata.user_id;
  
  if (!userId) {
    console.error('No user ID found in subscription metadata');
    return;
  }
  
  // Update the user's subscription in the database
  await supabaseClient
    .from('user_subscriptions')
    .update({
      stripe_subscription_id: subscription.id,
      plan: 'premium',
      status: subscription.status,
      current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
      current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', userId);
}

// Handle subscription changes
async function handleSubscriptionChange(subscription: any, supabaseClient: any) {
  // Find the user from the subscription customer ID
  const { data: userData } = await supabaseClient
    .from('user_subscriptions')
    .select('user_id')
    .eq('stripe_customer_id', subscription.customer)
    .single();
  
  if (!userData) {
    console.error('No user found for customer', subscription.customer);
    return;
  }
  
  // Update the subscription status
  await supabaseClient
    .from('user_subscriptions')
    .update({
      status: subscription.status,
      plan: subscription.status === 'active' ? 'premium' : 'free',
      current_period_start: subscription.current_period_start 
        ? new Date(subscription.current_period_start * 1000).toISOString() 
        : null,
      current_period_end: subscription.current_period_end 
        ? new Date(subscription.current_period_end * 1000).toISOString() 
        : null,
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', userData.user_id);
}

function createClient(supabaseUrl: string, supabaseKey: string) {
  const { createClient } = require('https://esm.sh/@supabase/supabase-js@2.38.4');
  return createClient(supabaseUrl, supabaseKey);
}
