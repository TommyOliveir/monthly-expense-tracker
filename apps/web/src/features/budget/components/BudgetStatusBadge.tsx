import {
  CircleAlertIcon,
  CircleCheckIcon,
  TriangleAlertIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { BudgetStatus } from "@/features/budget/types/budget";

type BudgetStatusBadgeProps = {
  status: Exclude<BudgetStatus, "unset">;
};

const STATUS_PRESENTATION = {
  "on-track": {
    label: "On track",
    Icon: CircleCheckIcon,
    className: "bg-success/12 text-success",
  },
  "near-limit": {
    label: "Near limit",
    Icon: TriangleAlertIcon,
    className: "bg-warning/12 text-warning",
  },
  over: {
    label: "Over budget",
    Icon: CircleAlertIcon,
    className: "bg-destructive/10 text-destructive",
  },
} as const;

export function BudgetStatusBadge({ status }: BudgetStatusBadgeProps) {
  const { label, Icon, className } = STATUS_PRESENTATION[status];

  return (
    <Badge className={cn("h-6 gap-1.5 px-2.5 text-xs", className)}>
      <Icon aria-hidden />
      {label}
    </Badge>
  );
}
