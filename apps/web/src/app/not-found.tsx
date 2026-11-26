import type { Metadata } from "next";
import Link from "next/link";
import { CompassIcon } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { StatusScreen } from "@/components/StatusScreen";
import { APP_NAME, APP_START_URL } from "@/features/pwa/appMetadata";

export const metadata: Metadata = {
  title: `Page not found · ${APP_NAME}`,
};

export default function NotFound() {
  return (
    <StatusScreen
      icon={<CompassIcon aria-hidden />}
      title="Page not found"
      description="This page doesn't exist or has moved."
      actions={
        <>
          <Link
            href={APP_START_URL}
            className={buttonVariants({ className: "h-10 px-4" })}
          >
            Go to your ledger
          </Link>
          <Link
            href="/"
            className={buttonVariants({
              variant: "outline",
              className: "h-10 px-4",
            })}
          >
            Home
          </Link>
        </>
      }
    />
  );
}
