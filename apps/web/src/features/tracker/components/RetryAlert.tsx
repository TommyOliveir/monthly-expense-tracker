import { CircleAlertIcon } from "lucide-react";
import {
  Alert,
  AlertAction,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

type RetryAlertProps = {
  title: string;
  description: string;
  // "destructive" when nothing can be shown, "default" over saved data.
  variant: "default" | "destructive";
  onRetry: () => void;
};

export function RetryAlert({
  title,
  description,
  variant,
  onRetry,
}: RetryAlertProps) {
  return (
    <Alert variant={variant} className="px-4 py-3">
      <CircleAlertIcon aria-hidden />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription>{description}</AlertDescription>
      <AlertAction className="top-2.5 right-3">
        <Button size="sm" variant="outline" onClick={onRetry}>
          Try again
        </Button>
      </AlertAction>
    </Alert>
  );
}
