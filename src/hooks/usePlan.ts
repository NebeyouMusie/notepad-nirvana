
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export type PlanType = "free" | "premium";
export type PlanStatus = "active" | "canceled" | "past_due" | "unpaid";

export interface Subscription {
  id: string;
  plan: PlanType;
  status: PlanStatus;
  current_period_end?: string | null;
}

export const usePlan = () => {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notesCount, setNotesCount] = useState(0);
  const [foldersCount, setFoldersCount] = useState(0);

  // Fetch user subscription status and resource counts
  useEffect(() => {
    const fetchSubscription = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      try {
        // Get subscription info
        const { data: subscriptionData, error: subError } = await supabase
          .from("user_subscriptions")
          .select("*")
          .eq("user_id", user.id)
          .single();

        if (subError) throw subError;

        // Get note count
        const { count: notesCount, error: notesError } = await supabase
          .from("notes")
          .select("*", { count: "exact", head: true })
          .eq("user_id", user.id)
          .eq("is_trashed", false);

        if (notesError) throw notesError;

        // Get folder count
        const { count: foldersCount, error: foldersError } = await supabase
          .from("folders")
          .select("*", { count: "exact", head: true })
          .eq("user_id", user.id);

        if (foldersError) throw foldersError;

        setSubscription(subscriptionData);
        setNotesCount(notesCount || 0);
        setFoldersCount(foldersCount || 0);
      } catch (error: any) {
        console.error("Error fetching subscription:", error);
        toast({
          title: "Error fetching subscription",
          description: error.message,
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchSubscription();
  }, [user]);

  const isPremium = subscription?.plan === "premium" && subscription?.status === "active";
  const notesLimit = isPremium ? Infinity : 10;
  const foldersLimit = isPremium ? Infinity : 5;
  const notesRemaining = Math.max(0, notesLimit - notesCount);
  const foldersRemaining = Math.max(0, foldersLimit - foldersCount);
  const isNearNotesLimit = !isPremium && notesRemaining <= 2 && notesRemaining > 0;
  const isNearFoldersLimit = !isPremium && foldersRemaining <= 1 && foldersRemaining > 0;
  const isAtNotesLimit = !isPremium && notesRemaining === 0;
  const isAtFoldersLimit = !isPremium && foldersRemaining === 0;

  return {
    subscription,
    isLoading,
    isPremium,
    notesCount,
    foldersCount,
    notesLimit,
    foldersLimit,
    notesRemaining,
    foldersRemaining,
    isNearNotesLimit,
    isNearFoldersLimit,
    isAtNotesLimit,
    isAtFoldersLimit,
  };
};
