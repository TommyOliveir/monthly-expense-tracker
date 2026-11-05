import Link from "next/link";
import type { Metadata } from "next";
import type { ReactNode } from "react";

// Shown publicly as the contact for privacy questions and account-deletion requests.
const CONTACT_EMAIL = "laridatommy@gmail.com";

const LAST_UPDATED = "November 5, 2026";

type PolicySection = {
  id: string;
  title: string;
  body: ReactNode;
};

export const metadata: Metadata = {
  title: "Privacy Policy — IPON Ledger",
  description:
    "What IPON Ledger collects, how it is used, where it is stored, and how to delete your account.",
  alternates: { canonical: "/privacy" },
};

function ContactEmail() {
  if (!CONTACT_EMAIL) {
    return (
      <span className="rounded bg-red-100 px-1 font-semibold text-red-700">
        [contact email not set]
      </span>
    );
  }

  return (
    <a
      href={`mailto:${CONTACT_EMAIL}`}
      className="font-semibold text-[#a4522f] underline underline-offset-2 hover:text-[#2c2115]"
    >
      {CONTACT_EMAIL}
    </a>
  );
}

const sections: PolicySection[] = [
  {
    id: "what-we-collect",
    title: "What we collect",
    body: (
      <>
        <p>We only collect what the app needs to work:</p>
        <ul>
          <li>
            <strong>Account details:</strong> your name and email address. If
            you sign up with a password, we store only a one-way hash of it,
            never the password itself.
          </li>
          <li>
            <strong>Google sign-in:</strong> if you choose &ldquo;Sign in with
            Google&rdquo;, Google shares your name, email address and Google
            account ID with us. We do not receive your Google password and we
            cannot access your Gmail, contacts, Drive or any other Google data.
          </li>
          <li>
            <strong>Your budget data:</strong> the monthly budgets, expenses
            (name, amount, date and payment method) and categories you enter.
          </li>
        </ul>
      </>
    ),
  },
  {
    id: "how-we-use-it",
    title: "How we use it",
    body: (
      <p>
        Your information is used only to sign you in and to show you your own
        budgets and expenses. We do not show ads, we do not sell your data, and
        we do not use analytics or tracking tools.
      </p>
    ),
  },
  {
    id: "where-it-is-stored",
    title: "Where it is stored",
    body: (
      <>
        <p>
          The app runs on these service providers, which process data on our
          behalf:
        </p>
        <ul>
          <li>
            <strong>Neon</strong>: the database that stores your account and
            budget data (hosted in the EU).
          </li>
          <li>
            <strong>Render</strong>: runs the server that handles your requests.
          </li>
          <li>
            <strong>Vercel</strong>: hosts the website.
          </li>
        </ul>
        <p>All traffic between your browser and these services uses HTTPS.</p>
      </>
    ),
  },
  {
    id: "in-your-browser",
    title: "What is saved in your browser",
    body: (
      <>
        <p>
          To keep you signed in, the app saves your session tokens, your basic
          profile (name and email) and your currency preference in your
          browser&apos;s local storage. Signing out removes the session and
          profile. The app itself does not set tracking cookies.
        </p>
        <p>
          The &ldquo;Sign in with Google&rdquo; button is loaded from Google and
          is covered by{" "}
          <a
            href="https://policies.google.com/privacy"
            className="font-semibold text-[#a4522f] underline underline-offset-2 hover:text-[#2c2115]"
          >
            Google&apos;s Privacy Policy
          </a>
          .
        </p>
      </>
    ),
  },
  {
    id: "sharing",
    title: "Sharing",
    body: (
      <p>
        We do not share your information with anyone except the service
        providers listed above, or when the law requires us to.
      </p>
    ),
  },
  {
    id: "deleting-your-data",
    title: "Keeping and deleting your data",
    body: (
      <>
        <p>
          We keep your data for as long as you have an account. To delete your
          account, email <ContactEmail /> from the address you signed up with.
          We will delete your account together with all of your budgets,
          expenses and categories.
        </p>
        <p>
          If you signed in with Google, you can also remove IPON Ledger&apos;s
          access at any time from{" "}
          <a
            href="https://myaccount.google.com/connections"
            className="font-semibold text-[#a4522f] underline underline-offset-2 hover:text-[#2c2115]"
          >
            your Google Account connections
          </a>
          .
        </p>
      </>
    ),
  },
  {
    id: "changes",
    title: "Changes to this policy",
    body: (
      <p>
        If this policy changes, we will update this page and the &ldquo;Last
        updated&rdquo; date at the top.
      </p>
    ),
  },
  {
    id: "contact",
    title: "Contact",
    body: (
      <p>
        Questions about your privacy? Email <ContactEmail />.
      </p>
    ),
  },
];

export default function PrivacyPage() {
  return (
    <main className="relative min-h-screen w-full overflow-hidden bg-[#faf5ec] font-sans text-[#2c2115]">
      {/* Sunlit wash, matching the landing page */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-48 left-1/4 size-[620px] rounded-full bg-[#f2c66d]/25 blur-3xl" />
        <div className="absolute -right-40 top-1/3 size-[520px] rounded-full bg-[#e89b6f]/20 blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto flex max-w-3xl flex-col gap-10 px-4 py-12 sm:px-6">
        <header>
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#a4522f]">
            Last updated {LAST_UPDATED}
          </p>
          <h1 className="mt-4 font-display text-4xl font-medium leading-tight tracking-tight sm:text-5xl">
            Privacy Policy
          </h1>
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-[#6d4f3c]">
            IPON Ledger is a simple monthly budget tracker. This page explains
            what we collect, why, and how you can delete it.
          </p>
        </header>

        <div className="rounded-2xl border border-[#2c2115]/15 bg-[#fffdf7]/85 p-6 shadow-[0_18px_40px_-24px_rgba(44,33,21,0.35)] sm:p-8">
          {sections.map((section, index) => (
            <section
              key={section.id}
              aria-labelledby={section.id}
              className={
                index === 0 ? "" : "mt-8 border-t border-[#2c2115]/10 pt-8"
              }
            >
              <h2
                id={section.id}
                className="font-display text-2xl font-medium tracking-tight"
              >
                {section.title}
              </h2>
              <div className="mt-3 space-y-3 text-[15px] leading-relaxed text-[#6d4f3c] [&_li]:mt-2 [&_strong]:text-[#2c2115] [&_ul]:list-disc [&_ul]:pl-5">
                {section.body}
              </div>
            </section>
          ))}
        </div>

        <footer className="flex flex-col gap-2 border-t border-[#2c2115]/15 pt-6 text-[11px] uppercase tracking-[0.2em] text-[#8a7a63] sm:flex-row sm:items-center sm:justify-between">
          <span>IPON Ledger</span>
          <Link href="/" className="hover:text-[#2c2115]">
            Back to home
          </Link>
        </footer>
      </div>
    </main>
  );
}
