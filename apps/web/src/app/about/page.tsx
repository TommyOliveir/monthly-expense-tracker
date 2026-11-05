import Link from "next/link";
import type { Metadata } from "next";
import { APP_NAME } from "@/features/pwa/appMetadata";

type Feature = {
  title: string;
  text: string;
};

export const metadata: Metadata = {
  title: `About — ${APP_NAME}`,
  description: `${APP_NAME} is a simple monthly budget and expense tracker. Ipon is Filipino for "savings" — see your month clearly so more of it stays yours.`,
  alternates: { canonical: "/about" },
};

const features: Feature[] = [
  {
    title: "A budget for every month",
    text: "Set a budget and watch what's spent and what's left as you go. Switch between months to see how they compare.",
  },
  {
    title: "Expenses in seconds",
    text: "Log the name, amount, date and payment method. Edit or delete any entry whenever you need to.",
  },
  {
    title: "Categories that make sense",
    text: "Start with sensible defaults, add your own, and see where the month went category by category.",
  },
  {
    title: "Your currency",
    text: "Pick the currency you think in, and every amount is shown in it.",
  },
  {
    title: "On your phone",
    text: "Install it on your home screen like an app. It tells you when you're offline.",
  },
  {
    title: "Sign in your way",
    text: "Use an email and password, or continue with Google.",
  },
];

export default function AboutPage() {
  return (
    <main className="relative min-h-screen w-full overflow-hidden bg-[#faf5ec] font-sans text-[#2c2115]">
      {/* Sunlit wash, matching the landing page */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-48 left-1/4 size-[620px] rounded-full bg-[#f2c66d]/25 blur-3xl" />
        <div className="absolute -right-40 top-1/3 size-[520px] rounded-full bg-[#e89b6f]/20 blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto flex max-w-3xl flex-col gap-14 px-4 py-12 sm:px-6">
        <header>
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#a4522f]">
            About
          </p>
          <h1 className="mt-4 font-display text-4xl font-medium leading-tight tracking-tight sm:text-5xl">
            A ledger for the money <em className="text-[#c96f4a]">you keep.</em>
          </h1>
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-[#6d4f3c]">
            {APP_NAME} is a simple monthly budget and expense tracker.{" "}
            <em>Ipon</em> is Filipino for &ldquo;savings&rdquo;: the money you
            set aside. That&apos;s the whole idea. See your month clearly, so
            more of it stays yours.
          </p>
        </header>

        <section aria-labelledby="what-it-does">
          <h2
            id="what-it-does"
            className="font-display text-2xl font-medium tracking-tight sm:text-3xl"
          >
            What it does
          </h2>
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {features.map((feature) => (
              <article
                key={feature.title}
                className="rounded-2xl border border-[#2c2115]/15 bg-[#fffdf7]/85 p-6 shadow-[0_18px_40px_-24px_rgba(44,33,21,0.35)]"
              >
                <h3 className="font-display text-lg font-medium">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-[#6d4f3c]">
                  {feature.text}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section
          aria-labelledby="privacy"
          className="rounded-2xl border border-[#2c2115]/15 bg-gradient-to-r from-[#f6dfa8]/70 via-[#f2c66d]/50 to-[#e89b6f]/40 p-6 sm:p-8"
        >
          <h2
            id="privacy"
            className="font-display text-2xl font-medium tracking-tight"
          >
            Privacy, briefly
          </h2>
          <p className="mt-3 text-[15px] leading-relaxed text-[#6d4f3c]">
            No ads, no tracking, and your data is never sold. It&apos;s only
            used to show you your own budget.{" "}
            <Link
              href="/privacy"
              className="font-semibold text-[#a4522f] underline underline-offset-2 hover:text-[#2c2115]"
            >
              Read the privacy policy
            </Link>
            .
          </p>
        </section>

        <section aria-labelledby="why-i-built-it">
          <h2
            id="why-i-built-it"
            className="font-display text-2xl font-medium tracking-tight sm:text-3xl"
          >
            Why I built it
          </h2>
          <div className="mt-4 space-y-3 text-[15px] leading-relaxed text-[#6d4f3c]">
            <p>
              I built {APP_NAME} because the budgeting apps I tried were either
              too complicated or wanted my bank login. I wanted something that
              does one thing well: show me where my money went this month.
            </p>
            <p>It&apos;s a personal project, and it stays simple on purpose.</p>
            <p className="font-display text-lg text-[#2c2115]">
              — Tommy Larida
            </p>
          </div>
        </section>

        <section className="text-center">
          <Link
            href="/tracker"
            className="inline-block rounded-full bg-[#c96f4a] px-8 py-4 text-sm font-semibold text-[#faf5ec] shadow-lg shadow-[#c96f4a]/30 transition hover:bg-[#2c2115]"
          >
            Open the tracker
          </Link>
        </section>

        <footer className="flex flex-col gap-2 border-t border-[#2c2115]/15 pt-6 text-[11px] uppercase tracking-[0.2em] text-[#8a7a63] sm:flex-row sm:items-center sm:justify-between">
          <span>{APP_NAME}</span>
          <div className="flex gap-6">
            <Link href="/" className="hover:text-[#2c2115]">
              Home
            </Link>
            <Link href="/privacy" className="hover:text-[#2c2115]">
              Privacy
            </Link>
          </div>
        </footer>
      </div>
    </main>
  );
}
