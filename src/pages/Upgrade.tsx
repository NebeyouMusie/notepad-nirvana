
import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { usePlan } from "@/hooks/usePlan";
import { useAuth } from "@/context/AuthContext";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { Check, Sparkles } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export default function Upgrade() {
  const { user } = useAuth();
  const { isPremium, notesLimit, foldersLimit, notesRemaining, foldersRemaining } = usePlan();
  const [isLoading, setIsLoading] = useState(false);

  const handleUpgrade = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { priceId: 'prod_S4eGhl7NHwiHOK' },
      });

      if (error) throw error;
      
      if (data?.url) {
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL returned');
      }
    } catch (error: any) {
      console.error('Error creating checkout session:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to create checkout session',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-6"
        >
          <div className="text-center mb-12">
            <h1 className="text-3xl font-bold mb-2">Upgrade Your Plan</h1>
            <p className="text-muted-foreground">
              Choose the plan that's right for you
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Free Plan */}
            <Card className={`border-2 ${!isPremium ? "border-primary" : "border-muted"}`}>
              <CardHeader>
                <CardTitle className="text-xl flex items-center">
                  Free Plan
                  {!isPremium && <span className="ml-2 text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full">Current</span>}
                </CardTitle>
                <CardDescription>Basic features for personal use</CardDescription>
                <div className="mt-4">
                  <span className="text-3xl font-bold">$0</span>
                  <span className="text-muted-foreground"> /forever</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-primary mr-2 mt-0.5" />
                    <span>Up to <strong>{notesLimit} notes</strong> ({notesRemaining} remaining)</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-primary mr-2 mt-0.5" />
                    <span>Up to <strong>{foldersLimit} folders</strong> ({foldersRemaining} remaining)</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-primary mr-2 mt-0.5" />
                    <span>Basic features access</span>
                  </li>
                </ul>
              </CardContent>
              <CardFooter>
                <Button
                  disabled={true}
                  variant="outline"
                  className="w-full"
                >
                  Current Plan
                </Button>
              </CardFooter>
            </Card>

            {/* Premium Plan */}
            <Card className={`border-2 ${isPremium ? "border-primary" : "border-muted"} relative overflow-hidden`}>
              {!isPremium && (
                <div className="absolute top-0 right-0 bg-primary text-primary-foreground px-3 py-1 -mr-8 mt-4 rotate-45 transform text-xs font-medium">
                  Recommended
                </div>
              )}
              <CardHeader>
                <CardTitle className="text-xl flex items-center">
                  <Sparkles className="h-5 w-5 mr-2 text-yellow-500" />
                  Premium Plan
                  {isPremium && <span className="ml-2 text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full">Current</span>}
                </CardTitle>
                <CardDescription>Advanced features for power users</CardDescription>
                <div className="mt-4">
                  <span className="text-3xl font-bold">$10</span>
                  <span className="text-muted-foreground"> /month</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-primary mr-2 mt-0.5" />
                    <span><strong>Unlimited notes</strong></span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-primary mr-2 mt-0.5" />
                    <span><strong>Unlimited folders</strong></span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-primary mr-2 mt-0.5" />
                    <span>Priority support</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-primary mr-2 mt-0.5" />
                    <span>All future features</span>
                  </li>
                </ul>
              </CardContent>
              <CardFooter>
                <Button 
                  onClick={handleUpgrade} 
                  disabled={isLoading || isPremium} 
                  className="w-full"
                >
                  {isLoading ? "Processing..." : isPremium ? "Current Plan" : "Upgrade Now"}
                </Button>
              </CardFooter>
            </Card>
          </div>

          <div className="mt-8 text-center text-sm text-muted-foreground">
            Questions about our plans? <a href="#" className="text-primary hover:underline">Contact support</a>
          </div>
        </motion.div>
      </div>
    </AppLayout>
  );
}
