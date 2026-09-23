import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Navbar() {
  return (
    <nav className="flex items-center justify-between p-4">
      <Link href="/" className="text-xl font-bold">
        MyApp
      </Link>

      <div className="flex gap-4">
        <Link href="/expense">Products</Link>
        <Link href="/login">Login</Link>
      </div>
    </nav>
  );
}
