
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
      console.error("No Stripe signature found");
      return new Response(JSON.stringify({ error: "No Stripe signature found" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
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
    
    // Create a Supabase client with the admin key - this bypasses RLS
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
        console.log("Processing checkout.session.completed:", session);
        
        // Get user from Supabase by matching Stripe customer ID or email
        let userId = null;
        
        if (session.customer) {
          // Try to find user by customer ID
          const { data: customersData } = await supabaseAdmin
            .from('user_subscriptions')
            .select('user_id')
            .eq('stripe_customer_id', session.customer)
            .maybeSingle();
            
          if (customersData) {
            userId = customersData.user_id;
            console.log("Found user by customer ID:", userId);
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
            console.log("Found user by email:", userId);
          }
        }
        
        // Additionally, try to extract user_id from metadata
        if (!userId && session.metadata?.user_id) {
          userId = session.metadata.user_id;
          console.log("Found user from metadata:", userId);
        }
        
        if (!userId) {
          console.error("Could not find user for this checkout session");
          return new Response(JSON.stringify({ error: "User not found" }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 400,
          });
        }
        
        console.log("Updating subscription for user:", userId);
        
        // For one-time payments, update or create the subscription to 'pro'
        const { data: existingSubscription } = await supabaseAdmin
          .from('user_subscriptions')
          .select('*')
          .eq('user_id', userId)
          .maybeSingle();
        
        if (existingSubscription) {
          // Update existing record
          const { error: updateError } = await supabaseAdmin
            .from('user_subscriptions')
            .update({
              plan: 'pro',
              status: 'active',
              stripe_customer_id: session.customer,
              updated_at: new Date().toISOString()
            })
            .eq('user_id', userId);
            
          if (updateError) {
            console.error("Error updating subscription:", updateError);
            return new Response(JSON.stringify({ error: updateError.message }), {
              headers: { ...corsHeaders, "Content-Type": "application/json" },
              status: 500,
            });
          }
        } else {
          // Create new record
          const { error: insertError } = await supabaseAdmin
            .from('user_subscriptions')
            .insert({
              user_id: userId,
              plan: 'pro',
              status: 'active',
              stripe_customer_id: session.customer,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            });
            
          if (insertError) {
            console.error("Error creating subscription:", insertError);
            return new Response(JSON.stringify({ error: insertError.message }), {
              headers: { ...corsHeaders, "Content-Type": "application/json" },
              status: 500,
            });
          }
        }
        
        console.log("Successfully updated subscription for user:", userId);
        break;
      }
      
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object;
        console.log("Processing payment_intent.succeeded:", paymentIntent);
        
        // Get user from metadata or customer ID
        let userId = null;
        
        if (paymentIntent.metadata?.user_id) {
          userId = paymentIntent.metadata.user_id;
          console.log("Found user from metadata:", userId);
        } else if (paymentIntent.customer) {
          // Try to find user by customer ID
          const { data: customerData } = await supabaseAdmin
            .from('user_subscriptions')
            .select('user_id')
            .eq('stripe_customer_id', paymentIntent.customer)
            .maybeSingle();
            
          if (customerData) {
            userId = customerData.user_id;
            console.log("Found user by customer ID:", userId);
          }
        }
        
        if (!userId) {
          console.error("Could not find user for this payment intent");
          return new Response(JSON.stringify({ error: "User not found" }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 400,
          });
        }
        
        console.log("Updating subscription for user:", userId);
        
        // Check if subscription exists
        const { data: existingSubscription } = await supabaseAdmin
          .from('user_subscriptions')
          .select('*')
          .eq('user_id', userId)
          .maybeSingle();
        
        if (existingSubscription) {
          // Update existing record
          const { error: updateError } = await supabaseAdmin
            .from('user_subscriptions')
            .update({
              plan: 'pro',
              status: 'active',
              updated_at: new Date().toISOString()
            })
            .eq('user_id', userId);
            
          if (updateError) {
            console.error("Error updating subscription:", updateError);
            return new Response(JSON.stringify({ error: updateError.message }), {
              headers: { ...corsHeaders, "Content-Type": "application/json" },
              status: 500,
            });
          }
        } else {
          // Create new record
          const { error: insertError } = await supabaseAdmin
            .from('user_subscriptions')
            .insert({
              user_id: userId,
              plan: 'pro',
              status: 'active',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            });
            
          if (insertError) {
            console.error("Error creating subscription:", insertError);
            return new Response(JSON.stringify({ error: insertError.message }), {
              headers: { ...corsHeaders, "Content-Type": "application/json" },
              status: 500,
            });
          }
        }
        
        console.log("Successfully updated subscription for user:", userId);
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
