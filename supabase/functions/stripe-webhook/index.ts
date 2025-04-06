
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@12.0.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

serve(async (req) => {
  // No CORS needed for webhooks as they're called directly by Stripe

  try {
    // Get the stripe signature from the request headers
    const signature = req.headers.get("stripe-signature");
    if (!signature) {
      return new Response(JSON.stringify({ error: "No Stripe signature found" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Get the raw request body
    const body = await req.text();
    
    // Initialize Stripe and verify the webhook signature
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });
    
    let event;
    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        Deno.env.get("STRIPE_WEBHOOK_SECRET") || ""
      );
    } catch (err) {
      console.error(`Webhook signature verification failed: ${err.message}`);
      return new Response(JSON.stringify({ error: `Webhook Error: ${err.message}` }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    console.log(`Processing webhook event: ${event.type}`);

    // Handle the event based on its type
    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object;
        const userId = paymentIntent.metadata?.user_id;
        
        if (!userId) {
          console.error('No user_id found in payment intent metadata');
          break;
        }
        
        console.log(`Payment succeeded for user ${userId}`);
        
        // Update the user's subscription to Pro after successful payment
        const { error } = await supabase
          .from('user_subscriptions')
          .update({
            plan: 'pro',
            status: 'active',
            current_period_end: null, // This is a lifetime plan
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', userId);
        
        if (error) {
          console.error('Error updating subscription:', error);
        } else {
          console.log(`Successfully upgraded user ${userId} to Pro plan`);
        }
        break;
      }
      
      case 'checkout.session.completed': {
        const session = event.data.object;
        const userId = session.metadata?.user_id;
        
        if (!userId) {
          console.error('No user_id found in session metadata');
          break;
        }
        
        console.log(`Checkout completed for user ${userId}`);
        
        // For one-time payments, if the payment is complete, upgrade the user
        if (session.payment_status === 'paid') {
          const { error } = await supabase
            .from('user_subscriptions')
            .update({
              plan: 'pro',
              status: 'active',
              current_period_end: null, // This is a lifetime plan
              updated_at: new Date().toISOString(),
            })
            .eq('user_id', userId);
          
          if (error) {
            console.error('Error updating subscription after checkout:', error);
          } else {
            console.log(`Successfully upgraded user ${userId} to Pro plan after checkout`);
          }
        }
        break;
      }
      
      // Add more event types as needed
      
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error(`Webhook error: ${error.message}`);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
