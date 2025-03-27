
import React from "react";
import { Badge } from "@/components/ui/badge";
import { cva } from "class-variance-authority";

const planBadgeVariants = cva("font-medium text-xs", {
  variants: {
    plan: {
      free: "bg-slate-200 text-slate-700 hover:bg-slate-200",
      pro: "bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:from-indigo-600 hover:to-purple-700",
    },
  },
  defaultVariants: {
    plan: "free",
  },
});

interface PlanBadgeProps {
  plan: "free" | "pro";
  className?: string;
}

export function PlanBadge({ plan, className }: PlanBadgeProps) {
  return (
    <Badge className={planBadgeVariants({ plan, className })}>
      {plan === "free" ? "Free" : "Pro"}
    </Badge>
  );
}
