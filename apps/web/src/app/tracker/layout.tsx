// import { cookies } from "next/headers";
// import { redirect } from "next/navigation";

export default function TrackerLayout({ children }: LayoutProps<"/tracker">) {
  // Server-side auth gate, disabled until auth moves to cookies:
  //   const token = (await cookies()).get("accessToken")?.value;
  //   if (!token) redirect("/login");

  return <section className="flex flex-1 flex-col">{children}</section>;
}
