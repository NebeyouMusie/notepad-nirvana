
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
        
        const { data, error } = await supabase
          .from('user_subscriptions')
          .select('*')
          .eq('user_id', user.id)
          .single();
        
        if (error) throw error;
        
        setSubscription({
          plan: data.plan as PlanType,
          status: data.status,
          currentPeriodEnd: data.current_period_end,
        });
      } catch (error) {
        console.error('Error fetching subscription:', error);
        toast({
          title: 'Error',
          description: 'Failed to load subscription information',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchSubscription();
  }, [user]);

  const createCheckoutSession = async () => {
    if (!user) {
      toast({
        title: 'Error',
        description: 'You must be logged in to upgrade',
        variant: 'destructive',
      });
      return;
    }

    try {
      const { data: { session } } = await supabase.functions.invoke('create-checkout', {
        body: { priceId: 'price_1PMV1IFajPW65tE46mzJHbvX' }
      });

      if (session && session.url) {
        window.location.href = session.url;
      } else {
        throw new Error('Failed to create checkout session');
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
      toast({
        title: 'Error',
        description: 'Failed to create checkout session',
        variant: 'destructive',
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
