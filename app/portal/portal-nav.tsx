"use client";

import { useState, type SVGProps } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { portalLogoutAction } from "./actions";

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

function IconPlus(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M12 5v14M5 12h14" />
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
    href: "/portal",
    label: "My reports",
    icon: IconInbox,
    match: (p) => p === "/portal",
  },
  {
    href: "/submit",
    label: "Submit new report",
    icon: IconPlus,
    match: (p) => p.startsWith("/submit"),
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
    <form action={portalLogoutAction}>
      <button type="submit" className="mt-1 text-xs font-medium text-teal-700 hover:underline">
        Sign out
      </button>
    </form>
  );
}

export function PortalNav({ email }: { email: string }) {
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
        <span className="text-sm font-semibold text-teal-700">Health Bridge Solution</span>
        <span className="w-8" aria-hidden />
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-black/30" onClick={() => setOpen(false)} aria-hidden />
          <div className="absolute inset-y-0 left-0 flex w-64 flex-col bg-white shadow-xl">
            <div className="flex items-center justify-between px-4 py-4">
              <div>
                <p className="text-sm font-semibold text-teal-700">Health Bridge Solution</p>
                <p className="text-xs text-neutral-400">Your reports</p>
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
          <p className="text-sm font-semibold text-teal-700">Health Bridge Solution</p>
          <p className="text-xs text-neutral-400">Your reports</p>
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
