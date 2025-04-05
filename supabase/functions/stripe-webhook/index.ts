
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0?target=deno";

serve(async (req) => {
  try {
    // Initialize Stripe 
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, {
      apiVersion: "2023-10-16",
    });
    
    // Get the signature from the header
    const signature = req.headers.get("stripe-signature")!;

    // Get the raw body
    const body = await req.text();
    
    // Verify webhook signature
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      Deno.env.get("STRIPE_WEBHOOK_SECRET")!
    );

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // Extract the object from the event
    const object = event.data.object as any;

    // Handle the event type
    switch (event.type) {
      // Handle successful subscription creation or update
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await handleSubscriptionChange(supabase, object);
        break;
      
      // Handle subscription cancellation
      case 'customer.subscription.deleted':
        await handleSubscriptionDelete(supabase, object);
        break;
    }

    // Return a 200 response to acknowledge receipt of the event
    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (err) {
    console.error(`Error handling webhook: ${err.message}`);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 400,
      headers: { "Content-Type": "application/json" }
    });
  }
});

async function handleSubscriptionChange(supabase, subscription) {
  try {
    // Get the customer from the subscription
    const customerId = subscription.customer;
    
    // Find the user with this customer ID
    const { data: users, error } = await supabase
      .from("user_subscriptions")
      .select("user_id")
      .eq("stripe_customer_id", customerId);
    
    if (error || !users.length) {
      console.error("Error finding user:", error);
      return;
    }
    
    const userId = users[0].user_id;
    
    // Update the subscription information
    await supabase
      .from("user_subscriptions")
      .update({
        stripe_subscription_id: subscription.id,
        plan: subscription.status === 'active' ? 'premium' : 'free',
        status: subscription.status,
        current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
        current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq("user_id", userId);
  } catch (error) {
    console.error("Error in handleSubscriptionChange:", error);
  }
}

async function handleSubscriptionDelete(supabase, subscription) {
  try {
    // Get the customer from the subscription
    const customerId = subscription.customer;
    
    // Find the user with this customer ID
    const { data: users, error } = await supabase
      .from("user_subscriptions")
      .select("user_id")
      .eq("stripe_customer_id", customerId);
    
    if (error || !users.length) {
      console.error("Error finding user:", error);
      return;
    }
    
    const userId = users[0].user_id;
    
    // Update the subscription to free
    await supabase
      .from("user_subscriptions")
      .update({
        plan: 'free',
        status: 'canceled',
        updated_at: new Date().toISOString()
      })
      .eq("user_id", userId);
  } catch (error) {
    console.error("Error in handleSubscriptionDelete:", error);
  }
}
