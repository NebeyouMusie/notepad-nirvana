
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface PlanLimitAlertProps {
  type: "notes" | "folders";
}

export function PlanLimitAlert({ type }: PlanLimitAlertProps) {
  const navigate = useNavigate();
  
  const title = type === "notes" 
    ? "Note Limit Reached" 
    : "Folder Limit Reached";
  
  const description = type === "notes"
    ? "You've reached the limit of 20 notes on the free plan."
    : "You've reached the limit of 5 folders on the free plan.";
  
  return (
    <Alert className="mb-4">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>{title}</AlertTitle>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mt-2">
        <AlertDescription>{description}</AlertDescription>
        <Button 
          size="sm" 
          className="bg-purple-600 hover:bg-purple-700 sm:ml-2"
          onClick={() => navigate("/upgrade")}
        >
          Upgrade Now
        </Button>
      </div>
    </Alert>
  );
}
