// app/tracker/layout.tsx
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function TrackerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  //   const token = cookieStore.get("accessToken")?.value;
  //   const token = false;

  //   if (!token) {
  //     redirect("/login");
  //   }

  return <section>{children}</section>;
}
