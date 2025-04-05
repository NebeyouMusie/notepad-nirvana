
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';

// Define types for subscription data
export interface Subscription {
  id?: string;
  user_id?: string;
  plan: 'free' | 'premium';
  status: string;
  stripe_customer_id?: string;
  stripe_subscription_id?: string;
  current_period_start?: string;
  current_period_end?: string;
  created_at?: string;
  updated_at?: string;
}

// Define what the hook returns
export interface PlanDetails {
  isPremium: boolean;
  isLoading: boolean;
  subscription: Subscription | null;
  notesLimit: number;
  foldersLimit: number;
  notesRemaining: number;
  foldersRemaining: number;
}

export function usePlan(): PlanDetails {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [notesCount, setNotesCount] = useState<number>(0);
  const [foldersCount, setFoldersCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Constants for free plan limits
  const FREE_NOTES_LIMIT = 10;
  const FREE_FOLDERS_LIMIT = 5;

  useEffect(() => {
    async function fetchSubscriptionData() {
      setIsLoading(true);
      
      if (!user) {
        setIsLoading(false);
        return;
      }
      
      try {
        // Get user's subscription details
        const { data: subscriptionData, error: subscriptionError } = await supabase
          .from('user_subscriptions')
          .select('*')
          .eq('user_id', user.id)
          .single();
        
        if (subscriptionError) {
          console.error('Error fetching subscription:', subscriptionError);
          return;
        }
        
        setSubscription(subscriptionData);
        
        // Count active notes (not in trash)
        const { data: notes, error: notesError } = await supabase
          .from('notes')
          .select('id')
          .eq('user_id', user.id)
          .eq('is_trashed', false);
        
        if (!notesError) {
          setNotesCount(notes?.length || 0);
        }
        
        // Count folders
        const { data: folders, error: foldersError } = await supabase
          .from('folders')
          .select('id')
          .eq('user_id', user.id);
        
        if (!foldersError) {
          setFoldersCount(folders?.length || 0);
        }
      } catch (error) {
        console.error('Error in usePlan hook:', error);
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchSubscriptionData();
  }, [user]);
  
  const isPremium = subscription?.plan === 'premium' && subscription?.status === 'active';
  
  // Calculate remaining items for free plan
  const notesRemaining = Math.max(0, FREE_NOTES_LIMIT - notesCount);
  const foldersRemaining = Math.max(0, FREE_FOLDERS_LIMIT - foldersCount);
  
  return {
    isPremium,
    isLoading,
    subscription,
    notesLimit: isPremium ? Infinity : FREE_NOTES_LIMIT,
    foldersLimit: isPremium ? Infinity : FREE_FOLDERS_LIMIT,
    notesRemaining,
    foldersRemaining
  };
}

export default usePlan;
