
import { useEffect, useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export default function Account() {
  const { user } = useAuth();
  const [created, setCreated] = useState<string | null>(null);
  
  useEffect(() => {
    if (user?.created_at) {
      const date = new Date(user.created_at);
      setCreated(date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }));
    }
  }, [user]);

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-6"
        >
          <h1 className="text-3xl font-semibold font-poppins">Account</h1>
          <p className="text-muted-foreground font-poppins">Manage your account settings</p>
        </motion.div>
        
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="font-poppins">Profile Information</CardTitle>
            <CardDescription className="font-poppins">Your personal account details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 font-poppins">
            <div>
              <label className="text-sm text-muted-foreground">Email</label>
              <p>{user?.email}</p>
            </div>
            {created && (
              <div>
                <label className="text-sm text-muted-foreground">Member since</label>
                <p>{created}</p>
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button variant="outline">Update Profile</Button>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-destructive font-poppins">Danger Zone</CardTitle>
            <CardDescription className="font-poppins">Irreversible account actions</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4 font-poppins">
              Deleting your account will remove all of your notes and data. This action cannot be undone.
            </p>
          </CardContent>
          <CardFooter>
            <Button variant="destructive">Delete Account</Button>
          </CardFooter>
        </Card>
      </div>
    </AppLayout>
  );
}
