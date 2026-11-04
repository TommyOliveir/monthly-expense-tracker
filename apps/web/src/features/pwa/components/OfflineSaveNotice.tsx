import { WifiOffIcon } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

type OfflineSaveNoticeProps = {
  /** What can't happen yet, e.g. "save this expense". */
  actionLabel: string;
};

export function OfflineSaveNotice({ actionLabel }: OfflineSaveNoticeProps) {
  return (
    <Alert className="border-warning/30 bg-warning/10">
      <WifiOffIcon aria-hidden className="text-warning" />
      <AlertTitle>You&apos;re offline</AlertTitle>
      <AlertDescription>
        Connect to the internet to {actionLabel}. What you entered stays here.
      </AlertDescription>
    </Alert>
  );
}
