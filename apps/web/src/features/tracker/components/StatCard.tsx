import { Card } from "@/components/ui/card";

type StatCardProps = {
  label: string;
  value: string;
  hint?: string;
};

export function StatCard({ label, value, hint }: StatCardProps) {
  return (
    <Card className="gap-1 px-4 py-4 sm:px-5 sm:py-5">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="font-display text-xl font-medium tabular-nums [overflow-wrap:anywhere] sm:text-2xl">
        {value}
      </p>
      {hint && <p className="text-sm text-muted-foreground">{hint}</p>}
    </Card>
  );
}
