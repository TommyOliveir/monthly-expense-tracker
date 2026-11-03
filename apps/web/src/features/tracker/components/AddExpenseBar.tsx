import { PlusIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

type AddExpenseBarProps = {
  onAddExpense: () => void;
};

/** Thumb-reachable primary action on phones; the header button takes over from `sm` up. */
export function AddExpenseBar({ onAddExpense }: AddExpenseBarProps) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-30 border-t bg-background/95 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur-sm sm:hidden">
      <Button className="h-12 w-full text-base" onClick={onAddExpense}>
        <PlusIcon aria-hidden />
        Add expense
      </Button>
    </div>
  );
}
