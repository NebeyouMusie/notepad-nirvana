
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { toast } from '@/hooks/use-toast';

export type PlanType = 'free' | 'pro';

export interface Subscription {
  plan: PlanType;
  status: 'active' | 'canceled' | 'incomplete' | 'past_due';
  currentPeriodEnd?: string | null;
}

export function usePlan() {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSubscription = async () => {
      if (!user) {
        setSubscription(null);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        
        // Use the raw query method to avoid type issues
        const { data, error } = await supabase
          .from('user_subscriptions')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle(); // Use maybeSingle instead of single to avoid errors when no record exists
        
        if (error && error.code !== 'PGRST116') {
          // Only throw for errors other than "no rows returned"
          throw error;
        }
        
        if (data) {
          setSubscription({
            plan: data.plan as PlanType,
            status: data.status as 'active' | 'canceled' | 'incomplete' | 'past_due',
            currentPeriodEnd: data.current_period_end,
          });
        } else {
          // Create a default subscription for new users
          setSubscription({
            plan: 'free',
            status: 'active',
            currentPeriodEnd: null,
          });
        }
      } catch (error) {
        console.error('Error fetching subscription:', error);
        // Don't show toast for subscription errors to avoid annoying users
      } finally {
        setIsLoading(false);
      }
    };

    fetchSubscription();
  }, [user]);

  const createCheckoutSession = async () => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to upgrade",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { priceId: 'price_1PMV1IFajPW65tE46mzJHbvX' }
      });

      if (error) throw error;
      
      if (data?.session?.url) {
        window.location.href = data.session.url;
      } else {
        throw new Error('Failed to create checkout session');
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
      toast({
        title: "Error",
        description: "Failed to create checkout session",
        variant: "destructive",
      });
    }
  };

  const isPro = subscription?.plan === 'pro' && subscription?.status === 'active';

  return {
    subscription,
    isLoading,
    createCheckoutSession,
    isPro,
  };
}
