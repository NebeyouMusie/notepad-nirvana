
import { useEffect, useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/context/AuthContext";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { usePlan } from "@/hooks/usePlan";
import { Link } from "react-router-dom";
import { ArrowRight, CalendarIcon, CreditCard, Shield, Star, Tag } from "lucide-react";

export default function Account() {
  const { user, signOut } = useAuth();
  const { subscription, isPremium, notesLimit, foldersLimit } = usePlan();
  const [isLoading, setIsLoading] = useState(false);
  
  const handleSignOut = async () => {
    setIsLoading(true);
    await signOut();
    setIsLoading(false);
  };
  
  // Format date for subscription details
  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Account</h1>
            <p className="text-muted-foreground">
              Manage your account settings and subscription
            </p>
          </div>

          <div className="grid gap-8">
            {/* Profile Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Profile Information</CardTitle>
                <CardDescription>Your personal account details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium mb-1">Email Address</p>
                  <p className="text-muted-foreground">{user?.email}</p>
                </div>
                <div>
                  <p className="text-sm font-medium mb-1">Account Created</p>
                  <p className="text-muted-foreground">{user?.created_at && new Date(user.created_at).toLocaleDateString()}</p>
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  variant="destructive" 
                  onClick={handleSignOut}
                  disabled={isLoading}
                >
                  {isLoading ? "Signing out..." : "Sign Out"}
                </Button>
              </CardFooter>
            </Card>

            {/* Subscription Information */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-xl">Subscription Plan</CardTitle>
                  <CardDescription>Your current subscription and billing details</CardDescription>
                </div>
                <Badge variant={isPremium ? "default" : "secondary"} className="text-xs">
                  {isPremium ? "Premium" : "Free Plan"}
                </Badge>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4">
                  <div className="flex items-center gap-3">
                    <Tag className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Plan</p>
                      <p className="text-muted-foreground">
                        {isPremium ? "Premium ($10/month)" : "Free"}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Star className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Features</p>
                      <p className="text-muted-foreground">
                        {isPremium 
                          ? "Unlimited notes and folders" 
                          : `Up to ${notesLimit} notes and ${foldersLimit} folders`}
                      </p>
                    </div>
                  </div>
                  
                  {isPremium && (
                    <>
                      <div className="flex items-center gap-3">
                        <CalendarIcon className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">Current Period</p>
                          <p className="text-muted-foreground">
                            {formatDate(subscription?.current_period_start)} - {formatDate(subscription?.current_period_end)}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <CreditCard className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">Billing Status</p>
                          <p className="text-muted-foreground capitalize">
                            {subscription?.status || "Active"}
                          </p>
                        </div>
                      </div>
                    </>
                  )}
                  
                  <div className="flex items-center gap-3">
                    <Shield className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Billing Protection</p>
                      <p className="text-muted-foreground">
                        All payments are securely processed through Stripe
                      </p>
                    </div>
                  </div>
                </div>

                <Separator />
                
                {!isPremium && (
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <h3 className="font-medium mb-2">Upgrade to Premium</h3>
                    <p className="text-muted-foreground text-sm mb-4">
                      Get unlimited notes and folders with our premium plan for just $10/month.
                    </p>
                    <Button asChild>
                      <Link to="/upgrade">
                        Upgrade Now <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                )}
              </CardContent>
              <CardFooter className="justify-between border-t pt-6">
                {isPremium ? (
                  <Button variant="outline" asChild>
                    <a 
                      href="https://billing.stripe.com/p/login/test_28o17I7jmeHQeXeaEE" 
                      target="_blank" 
                      rel="noopener noreferrer"
                    >
                      Manage Billing
                    </a>
                  </Button>
                ) : (
                  <Button variant="outline" asChild>
                    <Link to="/upgrade">View Plans</Link>
                  </Button>
                )}
              </CardFooter>
            </Card>
          </div>
        </motion.div>
      </div>
    </AppLayout>
  );
}
