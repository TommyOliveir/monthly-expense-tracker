import Link from "next/link";
import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";

const fraunces = Fraunces({ subsets: ["latin"], variable: "--font-display" });
const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "How to Get Rich Starts With a Budget — IPON Ledger",
  description:
    "The first step to getting rich is knowing where your money goes. IPON Ledger is a simple monthly budget tracker that helps you spend less, save more, and build wealth.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "How to Get Rich Starts With a Budget — IPON Ledger",
    description:
      "The first step to getting rich is knowing where your money goes. Track your monthly budget, cut wasteful spending, and start building wealth.",
    type: "website",
    url: "/",
  },
  twitter: { card: "summary_large_image" },
};

const steps = [
  {
    number: "01",
    title: "Know where every dollar goes",
    text: "Nobody gets rich by guessing. The first step to building wealth is seeing your real spending — every coffee, every subscription, every month.",
  },
  {
    number: "02",
    title: "Cut what doesn't serve you",
    text: "When your spending is visible, waste becomes obvious. Cancel the subscriptions you forgot about and cap the categories that quietly drain you.",
  },
  {
    number: "03",
    title: "Save the difference, every month",
    text: "Wealth is built from the gap between what you earn and what you spend. A budget widens that gap — month after month, it compounds.",
  },
];

const habits = [
  "Track every expense for 30 days",
  "Set a monthly budget and stick to it",
  "Pay yourself first — save before you spend",
  "Review your top spending category weekly",
  "Keep one fun category so the budget survives",
];

export default function LandingPage() {
  return (
    <main
      className={`${fraunces.variable} ${inter.variable} relative min-h-screen w-full overflow-hidden bg-[#faf5ec] font-sans text-[#2c2115]`}
    >
      {/* Sunlit wash */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-48 left-1/4 size-[620px] rounded-full bg-[#f2c66d]/30 blur-3xl" />
        <div className="absolute -right-40 top-1/3 size-[520px] rounded-full bg-[#e89b6f]/25 blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto flex max-w-4xl flex-col gap-16 px-6 py-12">
        <nav className="flex items-center justify-between border-b border-[#2c2115]/15 pb-6">
          <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.28em] text-[#a4522f]">
            <span className="size-2 rounded-full bg-[#c96f4a]" />
            IPON Ledger
          </div>
          <Link
            href="/tracker"
            className="rounded-full bg-[#2c2115] px-5 py-2.5 text-sm font-semibold text-[#faf5ec] transition hover:bg-[#c96f4a]"
          >
            Open the tracker
          </Link>
        </nav>

        <header className="text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#a4522f]">
            A simple monthly budget tracker
          </p>
          <h1 className="mx-auto mt-5 max-w-2xl font-[family-name:var(--font-display)] text-5xl font-medium leading-[1.08] tracking-tight sm:text-6xl">
            How to get rich?
            <br />
            Start by <em className="text-[#c96f4a]">knowing your money.</em>
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-[#6d4f3c]">
            Every fortune begins the same way: someone decided to watch where
            their money went. IPON Ledger makes that first step effortless —
            track your month, set a budget, and keep more of what you earn.
          </p>
          <div className="mt-8">
            <Link
              href="/tracker"
              className="inline-block rounded-full bg-[#c96f4a] px-8 py-4 text-sm font-semibold text-[#faf5ec] shadow-lg shadow-[#c96f4a]/30 transition hover:bg-[#2c2115]"
            >
              Start budgeting — it&apos;s free
            </Link>
          </div>
        </header>

        <section aria-labelledby="first-step">
          <h2
            id="first-step"
            className="text-center font-[family-name:var(--font-display)] text-3xl font-medium tracking-tight sm:text-4xl"
          >
            Why budgeting is the first step to wealth
          </h2>
          <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-3">
            {steps.map((step) => (
              <article
                key={step.number}
                className="rounded-2xl border border-[#2c2115]/15 bg-[#fffdf7]/80 p-6 shadow-[0_18px_40px_-24px_rgba(44,33,21,0.35)]"
              >
                <div className="font-[family-name:var(--font-display)] text-sm font-semibold text-[#c96f4a]">
                  {step.number}
                </div>
                <h3 className="mt-3 font-[family-name:var(--font-display)] text-xl font-medium">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-[#6d4f3c]">
                  {step.text}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section
          aria-labelledby="habits"
          className="rounded-2xl border border-[#2c2115]/15 bg-gradient-to-r from-[#f6dfa8]/70 via-[#f2c66d]/50 to-[#e89b6f]/40 p-8"
        >
          <h2
            id="habits"
            className="font-[family-name:var(--font-display)] text-2xl font-medium tracking-tight sm:text-3xl"
          >
            Five money habits of people who get rich
          </h2>
          <ul className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {habits.map((habit) => (
              <li
                key={habit}
                className="flex items-start gap-3 text-sm text-[#2c2115]"
              >
                <span className="mt-1.5 size-2 shrink-0 rounded-full bg-[#c96f4a]" />
                {habit}
              </li>
            ))}
          </ul>
          <p className="mt-6 text-sm leading-relaxed text-[#6d4f3c]">
            None of these require a higher salary. They require visibility — and
            that&apos;s exactly what a monthly budget gives you.
          </p>
        </section>

        <section className="text-center">
          <h2 className="font-[family-name:var(--font-display)] text-3xl font-medium tracking-tight sm:text-4xl">
            Your first month starts today.
          </h2>
          <p className="mx-auto mt-4 max-w-md text-[#6d4f3c]">
            Add your expenses, set a budget, and see exactly where you stand.
            Getting rich is a habit — this is rep one.
          </p>
          <div className="mt-8">
            <Link
              href="/tracker"
              className="inline-block rounded-full bg-[#2c2115] px-8 py-4 text-sm font-semibold text-[#faf5ec] transition hover:bg-[#c96f4a]"
            >
              Open IPON Ledger
            </Link>
          </div>
        </section>

        <footer className="flex items-center justify-between border-t border-[#2c2115]/15 pt-6 text-[11px] uppercase tracking-[0.2em] text-[#8a7a63]">
          <span>IPON Ledger</span>
          <span>Budget first. Wealth follows.</span>
        </footer>
      </div>
    </main>
  );
}
