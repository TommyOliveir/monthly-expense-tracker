"use client";

import { useState } from "react";
import Link from "next/link";
import { LogOutIcon, MenuIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

type NavLink = {
  href: string;
  label: string;
};

type MobileNavMenuProps = {
  links: ReadonlyArray<NavLink>;
  pathname: string;
  displayName: string;
  email?: string;
  onLogout: () => void;
  isLoggingOut: boolean;
};

export function MobileNavMenu({
  links,
  pathname,
  displayName,
  email,
  onLogout,
  isLoggingOut,
}: MobileNavMenuProps) {
  const [isOpen, setIsOpen] = useState(false);

  const closeMenu = () => setIsOpen(false);

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger
        render={
          <Button
            variant="ghost"
            className="size-10 p-0 sm:hidden"
            aria-label="Open menu"
          />
        }
      >
        <MenuIcon aria-hidden className="size-5" />
      </SheetTrigger>

      <SheetContent side="right" className="w-4/5 max-w-xs gap-0">
        <SheetHeader className="border-b pr-12">
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <div className="flex items-center gap-3">
            <span
              aria-hidden
              className="flex size-10 shrink-0 items-center justify-center rounded-full bg-brand/15 font-semibold text-brand-foreground"
            >
              {displayName.charAt(0).toUpperCase()}
            </span>
            <div className="flex min-w-0 flex-col">
              <span className="truncate text-sm font-medium text-foreground">
                {displayName}
              </span>
              {email && email !== displayName && (
                <SheetDescription className="truncate text-xs">
                  {email}
                </SheetDescription>
              )}
            </div>
          </div>
        </SheetHeader>

        <nav aria-label="Main" className="p-2">
          <ul className="flex flex-col gap-1">
            {links.map((link) => {
              const isActive = pathname === link.href;
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    aria-current={isActive ? "page" : undefined}
                    onClick={closeMenu}
                    className={cn(
                      "flex h-11 items-center rounded-md px-3 text-base font-medium text-muted-foreground outline-none transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50",
                      isActive && "bg-muted text-foreground",
                    )}
                  >
                    {link.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <SheetFooter className="border-t">
          <Button
            variant="destructive"
            className="h-11 w-full justify-start"
            onClick={onLogout}
            disabled={isLoggingOut}
          >
            <LogOutIcon aria-hidden />
            {isLoggingOut ? "Logging out…" : "Log out"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
