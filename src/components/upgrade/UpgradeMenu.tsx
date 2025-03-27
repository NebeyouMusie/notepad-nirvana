
import React from "react";
import { Link } from "react-router-dom";
import { Badge, BadgeCheck, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PlanBadge } from "@/components/upgrade/PlanBadge";
import { usePlan } from "@/hooks/usePlan";

export function UpgradeMenu() {
  const { currentPlan, isLoading } = usePlan();
  
  if (isLoading) {
    return (
      <div className="p-3 border-t">
        <div className="animate-pulse bg-muted h-8 rounded-md w-full"></div>
      </div>
    );
  }

  if (currentPlan === "pro") {
    return (
      <div className="p-3 border-t">
        <div className="rounded-md bg-gradient-to-r from-indigo-50 to-purple-50 p-3 border border-indigo-100">
          <div className="flex items-center mb-1">
            <BadgeCheck className="h-4 w-4 text-indigo-500 mr-1.5" />
            <span className="text-sm font-medium">Pro Plan Active</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Enjoy unlimited notes & folders
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 border-t">
      <div className="rounded-md bg-gradient-to-r from-indigo-50 to-purple-50 p-3 border border-indigo-100">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center">
            <Package className="h-4 w-4 text-indigo-500 mr-1.5" />
            <span className="text-sm font-medium">Free Plan</span>
          </div>
          <PlanBadge plan="free" />
        </div>
        <p className="text-xs text-muted-foreground mb-2">
          Limited to 20 notes & 5 folders
        </p>
        <Button 
          size="sm" 
          className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700"
          asChild
        >
          <Link to="/upgrade">Upgrade to Pro</Link>
        </Button>
      </div>
    </div>
  );
}
