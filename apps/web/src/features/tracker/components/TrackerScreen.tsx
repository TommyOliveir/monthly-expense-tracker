"use client";

import Link from "next/link";
import { LogInIcon } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { useAuth } from "@/features/auth/AuthProvider";
import { useCurrency } from "@/features/currency/hooks/useCurrency";
import { TrackerDashboard } from "@/features/tracker/components/TrackerDashboard";
import { TrackerSkeleton } from "@/features/tracker/components/TrackerSkeleton";

export function TrackerScreen() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { currency } = useCurrency();

  if (isLoading) return <TrackerSkeleton />;

  if (!isAuthenticated) {
    return (
      <main className="flex flex-1 items-center justify-center px-4 py-16">
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <LogInIcon aria-hidden />
            </EmptyMedia>
            <EmptyTitle>Sign in to see your ledger</EmptyTitle>
            <EmptyDescription>
              Your budget and expenses are saved to your account.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Link
              href="/login?mode=login"
              className={buttonVariants({ className: "h-10 px-4" })}
            >
              Sign in
            </Link>
          </EmptyContent>
        </Empty>
      </main>
    );
  }

  const firstName = user?.name?.trim().split(/\s+/)[0] || undefined;

  return <TrackerDashboard firstName={firstName} currency={currency} />;
}
