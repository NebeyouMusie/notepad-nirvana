
import { useState } from "react";
import { motion } from "framer-motion";
import { Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { AppLayout } from "@/components/layout/AppLayout";
import { useAuth } from "@/context/AuthContext";
import { usePlan } from "@/hooks/usePlan";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export default function Upgrade() {
  const { user } = useAuth();
  const { isPremium, subscription } = usePlan();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleCheckout = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "You need to be logged in to upgrade",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Call the create-checkout Edge Function
      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: {
          priceId: "prod_S4eGhl7NHwiHOK", // The product ID you provided
        },
      });

      if (error) throw error;

      if (data?.url) {
        // Redirect to Stripe Checkout
        window.location.href = data.url;
      } else {
        throw new Error("No checkout URL returned");
      }
    } catch (error) {
      console.error("Error creating checkout session:", error);
      toast({
        title: "Checkout failed",
        description: "There was a problem creating your checkout session",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-8 text-center"
        >
          <h1 className="text-4xl font-bold mb-4">Upgrade Your Experience</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Get unlimited notes and folders with our premium plan
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
          {/* Free Plan */}
          <Card className={`border-2 ${!isPremium ? "border-primary" : "border-border"}`}>
            <CardHeader>
              <CardTitle className="text-2xl">Free Plan</CardTitle>
              <div className="mt-2">
                <span className="text-3xl font-bold">$0</span>
                <span className="text-muted-foreground">/mo</span>
              </div>
              <CardDescription>Perfect for getting started</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center">
                  <Check className="h-5 w-5 text-primary mr-2" />
                  <span>Up to 10 notes</span>
                </div>
                <div className="flex items-center">
                  <Check className="h-5 w-5 text-primary mr-2" />
                  <span>Up to 5 folders</span>
                </div>
                <div className="flex items-center">
                  <Check className="h-5 w-5 text-primary mr-2" />
                  <span>Basic note formatting</span>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full" disabled={true}>
                {!isPremium ? "Current Plan" : "Basic Plan"}
              </Button>
            </CardFooter>
          </Card>

          {/* Premium Plan */}
          <Card className={`border-2 ${isPremium ? "border-primary" : "border-border"}`}>
            <CardHeader>
              <CardTitle className="text-2xl">Premium Plan</CardTitle>
              <div className="mt-2">
                <span className="text-3xl font-bold">$10</span>
                <span className="text-muted-foreground">/mo</span>
              </div>
              <CardDescription>For power users and professionals</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center">
                  <Check className="h-5 w-5 text-primary mr-2" />
                  <span>Unlimited notes</span>
                </div>
                <div className="flex items-center">
                  <Check className="h-5 w-5 text-primary mr-2" />
                  <span>Unlimited folders</span>
                </div>
                <div className="flex items-center">
                  <Check className="h-5 w-5 text-primary mr-2" />
                  <span>Priority support</span>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              {isPremium ? (
                <Button variant="outline" className="w-full" disabled={true}>
                  Current Plan
                </Button>
              ) : (
                <Button 
                  variant="default" 
                  className="w-full" 
                  onClick={handleCheckout}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    "Upgrade Now"
                  )}
                </Button>
              )}
            </CardFooter>
          </Card>
        </div>

        {isPremium && (
          <div className="mt-8 text-center">
            <p className="text-green-500 font-medium text-xl">
              You're currently on the Premium plan! Enjoy unlimited notes and folders.
            </p>
            {subscription?.current_period_end && (
              <p className="text-muted-foreground mt-2">
                Your subscription renews on {new Date(subscription.current_period_end).toLocaleDateString()}
              </p>
            )}
          </div>
        )}

        <div className="mt-16 max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold mb-4">Frequently Asked Questions</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium text-lg">What happens to my notes if I downgrade?</h3>
              <p className="text-muted-foreground">Your notes will still be saved, but you won't be able to create new ones beyond the free limit until you make space.</p>
            </div>
            <div>
              <h3 className="font-medium text-lg">Can I cancel my subscription anytime?</h3>
              <p className="text-muted-foreground">Yes, you can cancel your subscription at any time from your account page.</p>
            </div>
            <div>
              <h3 className="font-medium text-lg">How is my payment information secured?</h3>
              <p className="text-muted-foreground">All payments are processed securely through Stripe. We never store your card details.</p>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
