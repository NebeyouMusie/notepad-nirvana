
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export type PlanType = "free" | "pro";

interface PlanData {
  currentPlan: PlanType;
  notesCount: number;
  foldersCount: number;
  noteLimit: number;
  folderLimit: number;
  canCreateNote: boolean;
  canCreateFolder: boolean;
  isLoading: boolean;
  checkLimits: () => Promise<boolean>;
  refreshCounts: () => Promise<void>;
}

export function usePlan(): PlanData {
  const { user } = useAuth();
  const [currentPlan, setCurrentPlan] = useState<PlanType>("free");
  const [notesCount, setNotesCount] = useState(0);
  const [foldersCount, setFoldersCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const noteLimit = currentPlan === "pro" ? Infinity : 20;
  const folderLimit = currentPlan === "pro" ? Infinity : 5;
  
  const canCreateNote = notesCount < noteLimit;
  const canCreateFolder = foldersCount < folderLimit;

  const fetchPlanData = async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    try {
      // Fetch user's subscription status
      const { data: subscriptionData, error: subscriptionError } = await supabase
        .from("user_subscriptions")
        .select("plan")
        .eq("user_id", user.id)
        .single();

      if (subscriptionError && subscriptionError.code !== "PGRST116") {
        console.error("Error fetching subscription:", subscriptionError);
      }

      if (subscriptionData?.plan === "pro") {
        setCurrentPlan("pro");
      } else {
        setCurrentPlan("free");
      }

      // Fetch counts
      await refreshCounts();
    } catch (error) {
      console.error("Error in usePlan:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshCounts = async () => {
    if (!user) return;
    
    try {
      // Fetch notes count
      const { count: notesCountData, error: notesError } = await supabase
        .from("notes")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("is_trashed", false);
      
      if (notesError) throw notesError;
      setNotesCount(notesCountData || 0);
      
      // Fetch folders count
      const { count: foldersCountData, error: foldersError } = await supabase
        .from("folders")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id);
      
      if (foldersError) throw foldersError;
      setFoldersCount(foldersCountData || 0);
    } catch (error) {
      console.error("Error fetching counts:", error);
    }
  };

  const checkLimits = async () => {
    if (currentPlan === "pro") return true;
    
    await refreshCounts();
    
    if (notesCount >= noteLimit) {
      toast({
        title: "Note limit reached",
        description: `You've reached the limit of ${noteLimit} notes on the Free plan. Upgrade to Pro for unlimited notes.`,
        variant: "destructive",
      });
      return false;
    }
    
    if (foldersCount >= folderLimit) {
      toast({
        title: "Folder limit reached",
        description: `You've reached the limit of ${folderLimit} folders on the Free plan. Upgrade to Pro for unlimited folders.`,
        variant: "destructive",
      });
      return false;
    }
    
    return true;
  };

  useEffect(() => {
    fetchPlanData();
    
    // Set up subscription to refresh when data changes
    if (user) {
      const subscriptionChannel = supabase
        .channel('subscription-changes')
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'user_subscriptions',
          filter: `user_id=eq.${user.id}`,
        }, () => {
          fetchPlanData();
        })
        .on('postgres_changes', {
          event: 'UPDATE',
          schema: 'public',
          table: 'user_subscriptions',
          filter: `user_id=eq.${user.id}`,
        }, () => {
          fetchPlanData();
        })
        .subscribe();

      return () => {
        supabase.removeChannel(subscriptionChannel);
      };
    }
  }, [user]);

  return {
    currentPlan,
    notesCount,
    foldersCount,
    noteLimit,
    folderLimit,
    canCreateNote,
    canCreateFolder,
    isLoading,
    checkLimits,
    refreshCounts,
  };
}
