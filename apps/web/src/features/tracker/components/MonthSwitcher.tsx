import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

type MonthSwitcherProps = {
  showJumpToCurrent: boolean;
  onPrevious: () => void;
  onNext: () => void;
  onJumpToCurrent: () => void;
};

export function MonthSwitcher({
  showJumpToCurrent,
  onPrevious,
  onNext,
  onJumpToCurrent,
}: MonthSwitcherProps) {
  return (
    <div className="flex items-center gap-1">
      <Button
        variant="outline"
        size="icon-lg"
        className="size-10"
        aria-label="Previous month"
        onClick={onPrevious}
      >
        <ChevronLeftIcon aria-hidden />
      </Button>
      <Button
        variant="outline"
        size="icon-lg"
        className="size-10"
        aria-label="Next month"
        onClick={onNext}
      >
        <ChevronRightIcon aria-hidden />
      </Button>
      {showJumpToCurrent && (
        <Button variant="ghost" className="h-10 px-3" onClick={onJumpToCurrent}>
          This month
        </Button>
      )}
    </div>
  );
}
