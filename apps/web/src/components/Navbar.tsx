"use client";

import Link from "next/link";
import { Button } from "./ui/button";
import { useLogout } from "../../features/auth/hooks/useLogout";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function Navbar() {
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
    <nav className="flex items-center justify-between p-4">
      <Link href="/" className="text-xl font-bold">
        MyApp
      </Link>

      <div className="flex gap-4">
        <Link href="/login?mode=login">Login</Link>
        <Link href="/login?mode=register">Register</Link>

        <Button onClick={handleLogout} disabled={isLoggingOut}>
          Logout
        </Button>
      </div>
    </nav>
  );
}
