import type { ReactNode } from "react";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

type StatusScreenProps = {
  icon: ReactNode;
  title: string;
  description: string;
  actions: ReactNode;
};

/** Full-page message for states with no content to show (crash, 404). */
export function StatusScreen({
  icon,
  title,
  description,
  actions,
}: StatusScreenProps) {
  return (
    <main className="flex flex-1 items-center justify-center px-4 py-16">
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">{icon}</EmptyMedia>
          <EmptyTitle>{title}</EmptyTitle>
          <EmptyDescription>{description}</EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <div className="flex flex-wrap justify-center gap-2">{actions}</div>
        </EmptyContent>
      </Empty>
    </main>
  );
}
