"use client";

import { useState, type SVGProps } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { logoutAction } from "@/app/login/actions";

type NavItem = {
  href: string;
  label: string;
  icon: (props: SVGProps<SVGSVGElement>) => React.JSX.Element;
  match: (pathname: string) => boolean;
};

function IconInbox(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M3 12h4l2 3h6l2-3h4" />
      <path d="M5.5 5h13l2.5 7v6a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-6l2.5-7Z" />
    </svg>
  );
}

function IconBell(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M6 8a6 6 0 0 1 12 0c0 4 1.5 5.5 2 6.5H4c.5-1 2-2.5 2-6.5Z" />
      <path d="M9.5 17a2.5 2.5 0 0 0 5 0" />
    </svg>
  );
}

function IconCalendar(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="3.5" y="5" width="17" height="16" rx="2" />
      <path d="M8 3v4M16 3v4M3.5 10h17" />
    </svg>
  );
}

function IconStar(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M12 3.5l2.6 5.4 5.9.85-4.25 4.2 1 5.9L12 16.9l-5.25 2.95 1-5.9L3.5 9.75l5.9-.85L12 3.5Z" />
    </svg>
  );
}

function IconChart(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M4 20V10M11 20V4M18 20v-7" />
      <path d="M3 20h18" />
    </svg>
  );
}

function IconMenu(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  );
}

function IconClose(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}

const NAV_ITEMS: NavItem[] = [
  {
    href: "/dashboard",
    label: "Submissions",
    icon: IconInbox,
    match: (p) =>
      p === "/dashboard" ||
      (p.startsWith("/dashboard/") &&
        !p.startsWith("/dashboard/follow-ups") &&
        !p.startsWith("/dashboard/analytics") &&
        !p.startsWith("/dashboard/consultations") &&
        !p.startsWith("/dashboard/feedback")),
  },
  {
    href: "/dashboard/follow-ups",
    label: "Follow-ups",
    icon: IconBell,
    match: (p) => p.startsWith("/dashboard/follow-ups"),
  },
  {
    href: "/dashboard/consultations",
    label: "Consultations",
    icon: IconCalendar,
    match: (p) => p.startsWith("/dashboard/consultations"),
  },
  {
    href: "/dashboard/feedback",
    label: "Feedback",
    icon: IconStar,
    match: (p) => p.startsWith("/dashboard/feedback"),
  },
  {
    href: "/dashboard/analytics",
    label: "Analytics",
    icon: IconChart,
    match: (p) => p.startsWith("/dashboard/analytics"),
  },
];

function NavLinks({ pathname, onNavigate }: { pathname: string; onNavigate?: () => void }) {
  return (
    <nav className="flex-1 space-y-1 px-3">
      {NAV_ITEMS.map((item) => {
        const active = item.match(pathname);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              active
                ? "bg-teal-50 text-teal-700"
                : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900"
            }`}
          >
            <Icon className="h-4 w-4 shrink-0" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

function SignOutForm() {
  return (
    <form action={logoutAction}>
      <button type="submit" className="mt-1 text-xs font-medium text-teal-700 hover:underline">
        Sign out
      </button>
    </form>
  );
}

export function DashboardNav({ email }: { email: string }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Mobile top bar */}
      <div className="flex items-center justify-between border-b border-neutral-200 bg-white px-4 py-3 md:hidden">
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Open menu"
          className="rounded-md p-1.5 text-neutral-600 hover:bg-neutral-100"
        >
          <IconMenu className="h-5 w-5" />
        </button>
        <span className="text-sm font-semibold text-teal-700">HealthLens</span>
        <span className="w-8" aria-hidden />
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-black/30" onClick={() => setOpen(false)} aria-hidden />
          <div className="absolute inset-y-0 left-0 flex w-64 flex-col bg-white shadow-xl">
            <div className="flex items-center justify-between px-4 py-4">
              <div>
                <p className="text-sm font-semibold text-teal-700">HealthLens</p>
                <p className="text-xs text-neutral-400">Staff dashboard</p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close menu"
                className="rounded-md p-1.5 text-neutral-500 hover:bg-neutral-100"
              >
                <IconClose className="h-5 w-5" />
              </button>
            </div>
            <NavLinks pathname={pathname} onNavigate={() => setOpen(false)} />
            <div className="border-t border-neutral-200 px-4 py-3">
              <p className="truncate text-xs text-neutral-400">{email}</p>
              <SignOutForm />
            </div>
          </div>
        </div>
      )}

      {/* Desktop fixed sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 flex-col border-r border-neutral-200 bg-white md:flex">
        <div className="px-5 py-5">
          <p className="text-sm font-semibold text-teal-700">HealthLens</p>
          <p className="text-xs text-neutral-400">Staff dashboard</p>
        </div>
        <NavLinks pathname={pathname} />
        <div className="border-t border-neutral-200 px-4 py-3">
          <p className="truncate text-xs text-neutral-400">{email}</p>
          <SignOutForm />
        </div>
      </aside>
    </>
  );
}
