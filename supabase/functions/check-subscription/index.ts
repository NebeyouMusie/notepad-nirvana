
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.3';

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
    
    // Check the user's subscription
    const { data: subscription, error: subscriptionError } = await supabaseClient
      .from('user_subscriptions')
      .select('plan, payment_status')
      .eq('user_id', user.id)
      .maybeSingle();
    
    if (subscriptionError) {
      throw subscriptionError;
    }
    
    // Get note and folder counts
    const { count: notesCount, error: notesError } = await supabaseClient
      .from('notes')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('is_trashed', false);
    
    if (notesError) {
      throw notesError;
    }
    
    const { count: foldersCount, error: foldersError } = await supabaseClient
      .from('folders')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id);
    
    if (foldersError) {
      throw foldersError;
    }
    
    // Return the subscription status
    return new Response(
      JSON.stringify({
        plan: subscription?.plan || 'free',
        paymentStatus: subscription?.payment_status,
        notesCount: notesCount || 0,
        foldersCount: foldersCount || 0,
        noteLimit: subscription?.plan === 'pro' ? Infinity : 20,
        folderLimit: subscription?.plan === 'pro' ? Infinity : 5,
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );
    
  } catch (error) {
    console.error('Error checking subscription:', error);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
