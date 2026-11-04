import type { Metadata } from "next";
import Link from "next/link";
import { WifiOffIcon } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { APP_NAME, APP_START_URL } from "@/features/pwa/appMetadata";

export const metadata: Metadata = {
  title: `Offline · ${APP_NAME}`,
};

/** Served by the service worker when a page isn't cached and there is no connection. */
export default function OfflinePage() {
  return (
    <main className="flex flex-1 items-center justify-center px-4 py-16">
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <WifiOffIcon aria-hidden />
          </EmptyMedia>
          <EmptyTitle>You&apos;re offline</EmptyTitle>
          <EmptyDescription>
            Your ledger needs a connection to load. Check your Wi-Fi or mobile
            data and try again.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Link
            href={APP_START_URL}
            className={buttonVariants({ className: "h-10 px-4" })}
          >
            Try again
          </Link>
        </EmptyContent>
      </Empty>
    </main>
  );
}
