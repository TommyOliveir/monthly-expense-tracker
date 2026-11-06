"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOutIcon } from "lucide-react";
import { toast } from "sonner";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useAuth } from "@/features/auth/AuthProvider";
import { useLogout } from "@/features/auth/hooks/useLogout";
import { MobileNavMenu } from "@/components/MobileNavMenu";

const APP_LINKS = [
  { href: "/tracker", label: "Tracker" },
  { href: "/about", label: "About" },
] as const;

export default function Navbar() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { logout, isLoggingOut } = useLogout();
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = () => {
    logout(undefined, {
      onSuccess: () => {
        toast.success("Logged out successfully");
        router.push("/login");
      },
      onError: (error) => {
        // Tokens are already cleared locally, so the user is logged out either way.
        toast.error("Could not reach server, but logged out locally.");
        console.error("Logout server error:", error);
        router.push("/login");
      },
    });
  };

  const displayName = user?.name || user?.email || "Account";

  return (
    <nav className="sticky top-0 z-40 w-full border-b bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-6">
          <Link
            href="/"
            className="flex items-center gap-2 rounded-md outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            <span aria-hidden className="size-2.5 rounded-full bg-brand" />
            <span className="text-sm font-semibold tracking-[0.2em] uppercase">
              IPON Ledger
            </span>
          </Link>

          {isAuthenticated && (
            <ul className="hidden items-center gap-1 sm:flex">
              {APP_LINKS.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      aria-current={isActive ? "page" : undefined}
                      className={cn(
                        buttonVariants({ variant: "ghost" }),
                        "h-9 px-3 text-muted-foreground",
                        isActive && "bg-muted text-foreground",
                      )}
                    >
                      {link.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Hide auth actions until the stored session is hydrated to avoid a flash */}
        {!isLoading && (
          <div className="flex items-center gap-2">
            {isAuthenticated ? (
              <>
                <MobileNavMenu
                  links={APP_LINKS}
                  pathname={pathname}
                  displayName={displayName}
                  email={user?.email}
                  onLogout={handleLogout}
                  isLoggingOut={isLoggingOut}
                />
                <div className="hidden sm:flex">
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      render={
                        <Button
                          variant="ghost"
                          className="size-10 rounded-full bg-brand/15 p-0 font-semibold text-brand-foreground hover:bg-brand/25"
                          aria-label={`Account menu for ${displayName}`}
                        />
                      }
                    >
                      {displayName.charAt(0).toUpperCase()}
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-60">
                      <DropdownMenuGroup>
                        <DropdownMenuLabel className="flex flex-col gap-0.5 py-1.5">
                          <span className="truncate text-sm font-medium text-foreground">
                            {displayName}
                          </span>
                          {user?.email && user.name && (
                            <span className="truncate text-xs font-normal text-muted-foreground">
                              {user.email}
                            </span>
                          )}
                        </DropdownMenuLabel>
                      </DropdownMenuGroup>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        variant="destructive"
                        className="h-9"
                        onClick={handleLogout}
                        disabled={isLoggingOut}
                      >
                        <LogOutIcon aria-hidden />
                        {isLoggingOut ? "Logging out…" : "Log out"}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </>
            ) : (
              <>
                <Link
                  href="/login?mode=login"
                  className={cn(
                    buttonVariants({ variant: "ghost" }),
                    "h-10 px-4",
                  )}
                >
                  Log in
                </Link>
                <Link
                  href="/login?mode=register"
                  className={cn(buttonVariants(), "h-10 px-4")}
                >
                  Register
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
