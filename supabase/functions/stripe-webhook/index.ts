
// Follow this setup guide to integrate the Deno runtime and Supabase client:
// https://docs.supabase.com/guides/functions/connect-to-supabase

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders, status: 204 });
  }
  
  try {
    // Get the request body as a string
    const body = await req.text();
    
    // Get the Stripe signature from the request headers
    const signature = req.headers.get("stripe-signature");
    
    if (!signature) {
      throw new Error("No Stripe signature found");
    }
    
    // Initialize Stripe with the secret key
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });
    
    // Verify and construct the event
    let event;
    const endpointSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
    
    try {
      event = stripe.webhooks.constructEvent(body, signature, endpointSecret);
    } catch (err) {
      console.error(`Webhook Error: ${err.message}`);
      return new Response(JSON.stringify({ error: err.message }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    
    console.log(`Event received: ${event.type}`);
    
    // Create a Supabase client with the admin key
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") || "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "",
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );
    
    // Handle different event types
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        
        // Get user from Supabase by matching Stripe customer ID or email
        let userId = null;
        
        if (session.customer) {
          // Try to find user by customer ID
          const { data: subData } = await supabaseAdmin
            .from('user_subscriptions')
            .select('user_id')
            .eq('stripe_customer_id', session.customer)
            .maybeSingle();
            
          if (subData) {
            userId = subData.user_id;
          }
        }
        
        if (!userId && session.customer_email) {
          // Try to find user by email
          const { data: userData } = await supabaseAdmin
            .auth.admin.listUsers();
            
          const matchedUser = userData.users.find(u => 
            u.email?.toLowerCase() === session.customer_email.toLowerCase()
          );
          
          if (matchedUser) {
            userId = matchedUser.id;
          }
        }
        
        if (!userId) {
          console.error("Could not find user for this checkout session");
          break;
        }
        
        // For one-time payments, update the subscription to 'pro'
        if (session.mode === 'payment') {
          const { error: updateError } = await supabaseAdmin
            .from('user_subscriptions')
            .update({
              plan: 'pro',
              status: 'active',
              stripe_customer_id: session.customer,
              // For one-time payments, we don't need to set period_end
            })
            .eq('user_id', userId);
            
          if (updateError) {
            console.error("Error updating subscription:", updateError);
          }
        }
        
        break;
      }
      
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object;
        
        // If this is for a one-time payment, we can use the customer ID
        // to find the user and update their subscription
        if (paymentIntent.customer) {
          const { data: subData } = await supabaseAdmin
            .from('user_subscriptions')
            .select('user_id')
            .eq('stripe_customer_id', paymentIntent.customer)
            .maybeSingle();
            
          if (subData?.user_id) {
            const { error: updateError } = await supabaseAdmin
              .from('user_subscriptions')
              .update({
                plan: 'pro',
                status: 'active',
              })
              .eq('user_id', subData.user_id);
              
            if (updateError) {
              console.error("Error updating subscription:", updateError);
            }
          }
        }
        
        break;
      }
      
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }
    
    // Return a response to acknowledge receipt of the event
    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Webhook error:", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
