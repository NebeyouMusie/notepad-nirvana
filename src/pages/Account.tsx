
import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";
import { usePlan } from "@/hooks/usePlan";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { User, LogOut, AlertTriangle, Sparkles, Calendar } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";

export default function Account() {
  const { user, signOut } = useAuth();
  const { subscription, isPremium, notesLimit, foldersLimit, isLoading: planLoading } = usePlan();
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const handleDeleteAccount = async () => {
    if (confirmText !== user?.email) return;
    
    setIsDeleting(true);
    
    try {
      // Delete user data from database
      // This is just a suggestion - actual implementation would depend on your database structure
      // You would need to delete all user-related data from your database tables
      await supabase
        .from('notes')
        .delete()
        .eq('user_id', user?.id);
        
      // Delete the user's authentication record
      const { error } = await supabase.auth.admin.deleteUser(user?.id || '');
      
      if (error) throw error;
      
      toast({
        title: "Account deleted",
        description: "Your account and all associated data have been deleted",
      });
      
      signOut();
    } catch (error: any) {
      toast({
        title: "Error deleting account",
        description: error.message || "An error occurred while deleting your account",
        variant: "destructive",
      });
      setIsDeleting(false);
    }
  };

  // Format subscription end date if available
  const formattedEndDate = subscription?.current_period_end 
    ? format(new Date(subscription.current_period_end), 'MMMM d, yyyy') 
    : null;

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-6"
        >
          <div className="flex items-center">
            <User className="mr-2 h-6 w-6" />
            <h1 className="text-3xl font-semibold">Account</h1>
          </div>
          <p className="text-muted-foreground">
            Manage your account settings and preferences
          </p>
        </motion.div>
        
        <div className="space-y-6">
          <div className="bg-card border rounded-lg p-6">
            <h2 className="text-xl font-medium mb-4">Profile Information</h2>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                value={user?.email || ""}
                disabled
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground">
                Your email cannot be changed
              </p>
            </div>
          </div>
          
          {/* Subscription section */}
          <div className="bg-card border rounded-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="h-5 w-5 text-yellow-500" />
              <h2 className="text-xl font-medium">Subscription</h2>
            </div>
            
            {planLoading ? (
              <div className="py-4 text-center text-muted-foreground">
                Loading subscription information...
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-muted/50 rounded-lg">
                  <div>
                    <h3 className="font-medium flex items-center">
                      {isPremium ? (
                        <>
                          <span className="mr-2">Premium Plan</span>
                          <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full">Active</span>
                        </>
                      ) : (
                        <>
                          <span className="mr-2">Free Plan</span>
                          <span className="text-xs bg-muted-foreground text-background px-2 py-0.5 rounded-full">Basic</span>
                        </>
                      )}
                    </h3>
                    
                    <p className="text-sm text-muted-foreground mt-1">
                      {isPremium 
                        ? "You have access to all premium features"
                        : `Limited to ${notesLimit} notes and ${foldersLimit} folders`
                      }
                    </p>
                    
                    {isPremium && formattedEndDate && (
                      <div className="flex items-center gap-1 mt-1 text-sm">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>Renews on {formattedEndDate}</span>
                      </div>
                    )}
                  </div>
                  
                  <Button 
                    asChild={isPremium ? false : true}
                    variant={isPremium ? "outline" : "default"}
                    className={isPremium ? "" : "sm:self-end"}
                    disabled={isPremium}
                  >
                    {isPremium ? (
                      "Manage Subscription"
                    ) : (
                      <Link to="/upgrade">
                        Upgrade to Premium
                      </Link>
                    )}
                  </Button>
                </div>
                
                {!isPremium && (
                  <div className="text-sm">
                    <p>
                      Upgrade to <strong>Premium</strong> to unlock:
                    </p>
                    <ul className="list-disc list-inside mt-2 space-y-1 text-muted-foreground">
                      <li>Unlimited notes and folders</li>
                      <li>Priority support</li>
                      <li>All future premium features</li>
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
          
          <div className="bg-card border rounded-lg p-6">
            <h2 className="text-xl font-medium mb-4">Account Actions</h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="font-medium">Sign Out</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  Sign out of your account on this device
                </p>
                <Button 
                  variant="outline"
                  onClick={signOut}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </Button>
              </div>
            </div>
          </div>
          
          {/* Danger Zone */}
          <div className="bg-card border border-destructive/20 rounded-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              <h2 className="text-xl font-medium text-destructive">Danger Zone</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <h3 className="font-medium">Delete Account</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  Permanently delete your account and all your data. This action cannot be undone.
                </p>
                
                <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive">
                      Delete Account
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete your account
                        and remove all your data from our servers.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    
                    <div className="space-y-2 py-2">
                      <Label htmlFor="confirm-email">
                        Type <span className="font-medium">{user?.email}</span> to confirm
                      </Label>
                      <Input 
                        id="confirm-email"
                        value={confirmText}
                        onChange={(e) => setConfirmText(e.target.value)}
                        placeholder={user?.email}
                        className="mt-1"
                      />
                    </div>
                    
                    <AlertDialogFooter>
                      <AlertDialogCancel asChild>
                        <Button variant="outline">Cancel</Button>
                      </AlertDialogCancel>
                      <AlertDialogAction asChild>
                        <Button 
                          variant="destructive" 
                          onClick={handleDeleteAccount}
                          disabled={confirmText !== user?.email || isDeleting}
                        >
                          {isDeleting ? "Deleting..." : "Delete Account"}
                        </Button>
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
