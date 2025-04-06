
import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
import { Progress } from "@/components/ui/progress";
import { LogOut } from "lucide-react";
import { usePlan } from "@/hooks/usePlan";

export default function Account() {
  const { user, signOut } = useAuth();
  const { subscription, isLoading: isPlanLoading } = usePlan();
  const navigate = useNavigate();

  const [isLoadingLogout, setIsLoadingLogout] = useState(false);
  const [isLoadingDelete, setIsLoadingDelete] = useState(false);
  const [deleteAccountDialog, setDeleteAccountDialog] = useState(false);

  const handleDeleteAccount = async () => {
    setIsLoadingDelete(true);
    try {
      if (!user) {
        throw new Error("No user session found");
      }

      const { error } = await supabase.auth.admin.deleteUser(user.id);

      if (error) {
        throw error;
      }

      toast({
        title: "Account deleted",
        description: "Your account has been successfully deleted.",
      });
      navigate("/auth");
    } catch (error: any) {
      console.error("Error deleting account:", error);
      toast({
        title: "Error",
        description:
          error.message || "Failed to delete account. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingDelete(false);
      setDeleteAccountDialog(false);
    }
  };

  const handleSignOut = async () => {
    setIsLoadingLogout(true);
    try {
      await signOut();
      toast({
        title: "Signed out",
        description: "You have been signed out successfully.",
      });
      navigate("/auth");
    } catch (error: any) {
      console.error("Error signing out:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to sign out. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingLogout(false);
    }
  };

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Account Settings</h1>
          <p className="text-muted-foreground">
            Manage your account settings and preferences.
          </p>
        </div>
        
        {/* Profile Information */}
        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>
              Your account information
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2">
              <div className="text-sm text-muted-foreground">Email</div>
              <div className="font-medium">{user?.email}</div>
            </div>
          </CardContent>
        </Card>

        {/* Subscription */}
        <Card>
          <CardHeader>
            <CardTitle>Subscription</CardTitle>
            <CardDescription>
              Manage your subscription plan and billing details.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            {isPlanLoading ? (
              <Progress value={75} />
            ) : subscription ? (
              <>
                <div className="grid grid-cols-sm items-center gap-4">
                  <div className="text-sm text-muted-foreground">Current Plan</div>
                  <span className="font-medium capitalize">{subscription.plan}</span>
                </div>
                <div className="grid grid-cols-sm items-center gap-4">
                  <div className="text-sm text-muted-foreground">Status</div>
                  <span className="font-medium capitalize">{subscription.status}</span>
                </div>
                {subscription.currentPeriodEnd && (
                  <div className="grid grid-cols-sm items-center gap-4">
                    <div className="text-sm text-muted-foreground">Current Period End</div>
                    <span className="font-medium">
                      {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
                    </span>
                  </div>
                )}
                {subscription.plan === 'free' && (
                  <Button onClick={() => navigate("/upgrade")}>
                    Upgrade to Pro
                  </Button>
                )}
              </>
            ) : (
              <p>No subscription found.</p>
            )}
          </CardContent>
        </Card>

        {/* Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Actions</CardTitle>
            <CardDescription>
              Common account actions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              variant="outline"
              onClick={handleSignOut}
              disabled={isLoadingLogout}
              className="w-full"
            >
              <LogOut className="mr-2 h-4 w-4" />
              {isLoadingLogout ? "Signing Out..." : "Sign Out"}
            </Button>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="border-destructive/50">
          <CardHeader>
            <CardTitle className="text-destructive">Danger Zone</CardTitle>
            <CardDescription>
              Irreversible actions that affect your account
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="w-full">Delete Account</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete
                    your account and remove your data from our servers.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeleteAccount}
                    disabled={isLoadingDelete}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    {isLoadingDelete ? "Deleting..." : "Delete"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
