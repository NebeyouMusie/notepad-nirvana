
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { toast } from '@/hooks/use-toast';
import { useLocation } from 'react-router-dom';

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
  const location = useLocation();

  // Check if we're returning from a successful payment
  const queryParams = new URLSearchParams(location.search);
  const paymentStatus = queryParams.get('payment_status');

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
          .single();
        
        if (error) {
          console.error('Error fetching subscription:', error);
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
        toast({
          title: "Error",
          description: "Failed to load subscription information",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchSubscription();
    
    // If returning from a successful payment, show a success message
    if (paymentStatus === 'success') {
      toast({
        title: "Payment Successful",
        description: "Thank you for upgrading to Pro! Your subscription should be updated shortly.",
        duration: 5000,
      });
    } else if (paymentStatus === 'canceled') {
      toast({
        title: "Payment Canceled",
        description: "Your payment was canceled. You can try again anytime.",
        duration: 5000,
      });
    }
  }, [user, paymentStatus]);

  // Set up real-time subscription updates
  useEffect(() => {
    if (!user) return;
    
    const channel = supabase
      .channel('subscription-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'user_subscriptions',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          console.log('Subscription updated:', payload);
          const newData = payload.new;
          
          if (newData) {
            setSubscription({
              plan: newData.plan as PlanType,
              status: newData.status as 'active' | 'canceled' | 'incomplete' | 'past_due',
              currentPeriodEnd: newData.current_period_end,
            });
            
            if (newData.plan === 'pro') {
              toast({
                title: "Upgrade Complete",
                description: "Your account has been upgraded to Pro! Enjoy unlimited notes and folders.",
                variant: "default",
                duration: 5000,
              });
            }
          }
        }
      )
      .subscribe();
      
    // Clean up the subscription when the component unmounts
    return () => {
      supabase.removeChannel(channel);
    };
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
