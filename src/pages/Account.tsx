
import { useEffect, useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAuth } from "@/context/AuthContext";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { usePlan } from "@/hooks/usePlan";
import { Link } from "react-router-dom";
import { ArrowRight, CalendarIcon, CreditCard, Shield, Star, Tag, AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export default function Account() {
  const { user, signOut } = useAuth();
  const { subscription, isPremium, notesLimit, foldersLimit } = usePlan();
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  
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
  
  const handleDeleteAccount = async () => {
    if (deleteConfirmation !== user?.email) {
      toast({
        title: "Confirmation failed",
        description: "Please type your email correctly to confirm deletion",
        variant: "destructive"
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      // In a real implementation, you would call an API endpoint to delete the user's account
      const { error } = await supabase.auth.admin.deleteUser(user?.id || "");
      
      if (error) throw error;
      
      toast({
        title: "Account deleted",
        description: "Your account has been permanently deleted"
      });
      
      // Sign out after deletion
      await signOut();
    } catch (error) {
      console.error("Error deleting account:", error);
      toast({
        title: "Error",
        description: "Failed to delete account. Please try again later.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
      setIsDeleteDialogOpen(false);
    }
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
            
            {/* Danger Zone */}
            <Card className="border-destructive/50">
              <CardHeader className="text-destructive">
                <CardTitle className="text-xl flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Danger Zone
                </CardTitle>
                <CardDescription>
                  Permanently delete your account and all your data
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Once you delete your account, there is no going back. All of your notes, folders and personal information will be permanently deleted.
                </p>
                <Button 
                  variant="destructive" 
                  onClick={() => setIsDeleteDialogOpen(true)}
                >
                  Delete Account
                </Button>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </div>
      
      {/* Delete Account Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-destructive flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Delete Account
            </DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete your account and remove your data from our servers.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <p className="text-sm mb-4">
              To confirm, please type your email address: <span className="font-semibold">{user?.email}</span>
            </p>
            <input 
              type="email"
              value={deleteConfirmation}
              onChange={(e) => setDeleteConfirmation(e.target.value)}
              placeholder="Enter your email address"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDeleteAccount}
              disabled={deleteConfirmation !== user?.email || isLoading}
            >
              {isLoading ? "Deleting..." : "Permanently Delete Account"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
