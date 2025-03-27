
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from 'https://esm.sh/stripe@14.21.0';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.3';

const STRIPE_SECRET_KEY = Deno.env.get('STRIPE_SECRET_KEY') || '';
const PRICE_ID = 'price_1PgH5fBEQRKN1oAkFEfNDJdU'; // This is your price ID for the $15 Pro lifetime plan

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY') || '';
    const supabaseClient = createClient(supabaseUrl, supabaseKey);

    // Get the user from the request
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    
    if (userError || !userData.user) {
      throw new Error('Authentication failed');
    }
    
    const user = userData.user;
    
    // Initialize Stripe
    const stripe = new Stripe(STRIPE_SECRET_KEY, {
      apiVersion: '2023-10-16',
    });
    
    // Check if the user already has a Customer ID
    const { data: subscriptions } = await supabaseClient
      .from('user_subscriptions')
      .select('stripe_customer_id, plan')
      .eq('user_id', user.id)
      .maybeSingle();
    
    // If user already has a pro subscription, don't create a new checkout
    if (subscriptions?.plan === 'pro') {
      return new Response(
        JSON.stringify({ 
          error: 'You already have a Pro subscription' 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      );
    }
    
    let customerId = subscriptions?.stripe_customer_id;
    
    // If no customer ID exists, create a customer in Stripe
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: {
          user_id: user.id,
        },
      });
      customerId = customer.id;
    }
    
    // Parse request body for additional data
    const requestData = await req.json().catch(() => ({}));
    const returnUrl = requestData.returnUrl || 'https://notes.example.com';
    
    // Create a checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price: PRICE_ID,
          quantity: 1,
        },
      ],
      mode: 'payment', // One-time payment
      success_url: `${returnUrl}/upgrade?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${returnUrl}/upgrade?canceled=true`,
      metadata: {
        user_id: user.id,
      },
    });
    
    // Store the checkout session information
    await supabaseClient
      .from('user_subscriptions')
      .upsert(
        {
          user_id: user.id,
          stripe_customer_id: customerId,
          stripe_session_id: session.id,
          payment_status: 'pending',
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: 'user_id',
        }
      );
    
    // Return the checkout session URL
    return new Response(
      JSON.stringify({ url: session.url }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );
    
  } catch (error) {
    console.error('Error creating checkout session:', error);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
