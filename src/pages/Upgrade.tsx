
import React, { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { BadgeCheck, CreditCard, Check, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { PlanBadge } from "@/components/upgrade/PlanBadge";
import { usePlan } from "@/hooks/usePlan";
import { useAuth } from "@/context/AuthContext";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export default function Upgrade() {
  const { currentPlan, notesCount, foldersCount, noteLimit, folderLimit } = usePlan();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const handleUpgrade = async () => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to upgrade your plan",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('create-checkout-session', {
        body: { returnUrl: window.location.origin },
      });

      if (error) throw error;

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
      toast({
        title: "Payment error",
        description: "Could not initiate the payment process. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto py-8 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-10 text-center"
        >
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Upgrade Your Notepad Experience</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Choose the plan that works best for you and take your note-taking to the next level.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Free Plan */}
          <Card className="relative overflow-hidden border-2">
            <div className="absolute top-0 left-0 w-full h-1 bg-slate-200"></div>
            <CardHeader>
              <div className="flex justify-between items-center mb-2">
                <CardTitle className="text-2xl font-bold">Free Plan</CardTitle>
                <PlanBadge plan="free" />
              </div>
              <CardDescription>Basic note-taking features</CardDescription>
              <div className="mt-4">
                <span className="text-3xl font-bold">$0</span>
                <span className="text-muted-foreground ml-1">for lifetime</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-start">
                  <Check className="h-5 w-5 text-slate-500 mr-2 mt-0.5" />
                  <span>
                    <strong>20 notes</strong> maximum
                    {currentPlan === "free" && (
                      <div className="text-sm text-muted-foreground">
                        {notesCount}/{noteLimit} used
                      </div>
                    )}
                  </span>
                </div>
                <div className="flex items-start">
                  <Check className="h-5 w-5 text-slate-500 mr-2 mt-0.5" />
                  <span>
                    <strong>5 folders</strong> maximum
                    {currentPlan === "free" && (
                      <div className="text-sm text-muted-foreground">
                        {foldersCount}/{folderLimit} used
                      </div>
                    )}
                  </span>
                </div>
                <div className="flex items-start">
                  <Check className="h-5 w-5 text-slate-500 mr-2 mt-0.5" />
                  <span>All basic features</span>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                variant="outline" 
                size="lg" 
                className="w-full" 
                disabled={true}
              >
                {currentPlan === "free" ? "Current Plan" : "Downgrade"}
              </Button>
            </CardFooter>
          </Card>

          {/* Pro Plan */}
          <Card className="relative overflow-hidden border-2 border-indigo-200">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-purple-600"></div>
            <CardHeader>
              <div className="flex justify-between items-center mb-2">
                <CardTitle className="text-2xl font-bold">Pro Plan</CardTitle>
                <PlanBadge plan="pro" />
              </div>
              <CardDescription>Advanced features for power users</CardDescription>
              <div className="mt-4">
                <span className="text-3xl font-bold">$15</span>
                <span className="text-muted-foreground ml-1">one-time payment</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-start">
                  <BadgeCheck className="h-5 w-5 text-indigo-500 mr-2 mt-0.5" />
                  <span><strong>Unlimited notes</strong></span>
                </div>
                <div className="flex items-start">
                  <BadgeCheck className="h-5 w-5 text-indigo-500 mr-2 mt-0.5" />
                  <span><strong>Unlimited folders</strong></span>
                </div>
                <div className="flex items-start">
                  <BadgeCheck className="h-5 w-5 text-indigo-500 mr-2 mt-0.5" />
                  <span>Priority support</span>
                </div>
                <div className="flex items-start">
                  <BadgeCheck className="h-5 w-5 text-indigo-500 mr-2 mt-0.5" />
                  <span>All current and future features</span>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              {currentPlan === "pro" ? (
                <Button 
                  size="lg" 
                  className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700"
                  disabled
                >
                  <Sparkles className="mr-2 h-4 w-4" />
                  Active Pro Plan
                </Button>
              ) : (
                <Button 
                  size="lg" 
                  className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700"
                  onClick={handleUpgrade}
                  disabled={isLoading}
                >
                  <CreditCard className="mr-2 h-4 w-4" />
                  {isLoading ? "Processing..." : "Upgrade Now"}
                </Button>
              )}
            </CardFooter>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
