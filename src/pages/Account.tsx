import { useState, useEffect } from "react";
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
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Settings2, User, Mail, Lock, LogOut } from "lucide-react";
import { usePlan } from "@/hooks/usePlan";

export default function Account() {
  const { user, signOut, updateUserProfile } = useAuth();
  const { subscription, isLoading: isPlanLoading } = usePlan();
  const navigate = useNavigate();

  const [name, setName] = useState(user?.user_metadata?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [isLoadingLogout, setIsLoadingLogout] = useState(false);
  const [isLoadingDelete, setIsLoadingDelete] = useState(false);
  const [deleteAccountDialog, setDeleteAccountDialog] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.user_metadata?.name || "");
      setEmail(user.email || "");
    }
  }, [user]);

  const handleUpdateProfile = async () => {
    if (!user) {
      toast({
        title: "Error",
        description: "No user session found",
        variant: "destructive",
      });
      return;
    }

    if (password && password !== confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }

    setIsUpdating(true);
    try {
      const updates: {
        email?: string;
        password?: string;
        data?: { name?: string };
      } = {
        data: {
          name: name,
        },
      };

      if (email !== user.email) {
        updates.email = email;
      }

      if (password) {
        updates.password = password;
      }

      await updateUserProfile(updates);

      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully",
      });
    } catch (error: any) {
      console.error("Error updating profile:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
      setPassword("");
      setConfirmPassword("");
    }
  };

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
        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>
              Update your profile information such as name and email address.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid grid-cols-sm items-center gap-4">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-sm items-center gap-4">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-sm items-center gap-4">
              <Label htmlFor="password">New Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-sm items-center gap-4">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
            <Button onClick={handleUpdateProfile} disabled={isUpdating}>
              {isUpdating ? "Updating..." : "Update Profile"}
            </Button>
          </CardContent>
        </Card>
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
                  <Label>Plan</Label>
                  <span className="font-medium">{subscription.plan}</span>
                </div>
                <div className="grid grid-cols-sm items-center gap-4">
                  <Label>Status</Label>
                  <span className="font-medium">{subscription.status}</span>
                </div>
                {subscription.currentPeriodEnd && (
                  <div className="grid grid-cols-sm items-center gap-4">
                    <Label>Current Period End</Label>
                    <span className="font-medium">
                      {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </>
            ) : (
              <p>No subscription found.</p>
            )}
            <Button onClick={() => navigate("/upgrade")}>
              {subscription?.plan === "pro" ? "Manage Subscription" : "Upgrade to Pro"}
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Danger Zone</CardTitle>
            <CardDescription>
              Here you can manage critical actions related to your account.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <Button
              variant="destructive"
              onClick={handleSignOut}
              disabled={isLoadingLogout}
            >
              {isLoadingLogout ? "Signing Out..." : "Sign Out"}
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">Delete Account</Button>
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
                    disabled={isLoadingDelete || isLoadingLogout}
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
