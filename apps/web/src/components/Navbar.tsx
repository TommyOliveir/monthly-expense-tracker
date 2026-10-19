"use client";

import Link from "next/link";
import { useLogout } from "../../features/auth/hooks/useLogout";
import { useAuth } from "../../features/auth/AuthProvider";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function Navbar() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { logout, isLoggingOut } = useLogout();
  const router = useRouter();

  const handleLogout = () => {
    logout(undefined, {
      onSuccess: () => {
        // Redirect to login page after successful logout
        toast.success("Logged out successfully");
        router.push("/login");
      },
      onError: (error) => {
        // Show a notification informing the user the server call failed
        toast.error("Could not reach server, but logged out locally.");
        console.error("Logout server error:", error);

        // Still redirect to login since local storage and tokens were wiped
        router.push("/login");
      },
    });
  };

  return (
    <nav className="sticky top-0 z-40 w-full border-b border-[#2c2115]/10 bg-[#faf5ec]/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link
          href={isAuthenticated ? "/tracker" : "/"}
          className="flex items-center gap-2 text-[#2c2115]"
        >
          <span className="size-2.5 rounded-full bg-[#c96f4a]" />
          <span className="text-sm font-semibold uppercase tracking-[0.28em]">
            IPON Ledger
          </span>
        </Link>

        {/* Hide auth actions until the stored session is hydrated to avoid a flash */}
        {!isLoading && (
          <div className="flex items-center gap-2 sm:gap-3">
            {isAuthenticated ? (
              <>
                {user && (
                  <span
                    title={`${user.name} · ${user.email}`}
                    aria-label={`Signed in as ${user.name || user.email}`}
                    className="grid size-9 place-items-center rounded-full bg-[#c96f4a]/15 text-sm font-semibold text-[#a4522f]"
                  >
                    {(user.name || user.email).charAt(0).toUpperCase()}
                  </span>
                )}
                <button
                  type="button"
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="rounded-full border border-[#2c2115]/20 px-4 py-2 text-sm font-semibold text-[#2c2115] transition hover:border-[#c96f4a] hover:text-[#c96f4a] disabled:opacity-50"
                >
                  {isLoggingOut ? "Logging out…" : "Logout"}
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login?mode=login"
                  className="rounded-full px-4 py-2 text-sm font-semibold text-[#2c2115] transition hover:text-[#c96f4a]"
                >
                  Login
                </Link>
                <Link
                  href="/login?mode=register"
                  className="rounded-full bg-[#2c2115] px-4 py-2 text-sm font-semibold text-[#faf5ec] shadow-md shadow-[#c96f4a]/20 transition hover:bg-[#c96f4a]"
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
