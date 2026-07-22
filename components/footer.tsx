import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-neutral-200 bg-white">
      <div className="max-w-5xl mx-auto px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-neutral-500">
        <p>© {new Date().getFullYear()} HealthLens (mysovera). Educational summaries, not a diagnosis.</p>
        <nav className="flex items-center gap-4">
          <Link href="/terms" className="hover:text-teal-700 hover:underline">Terms</Link>
          <Link href="/privacy" className="hover:text-teal-700 hover:underline">Privacy</Link>
          <Link href="/refund" className="hover:text-teal-700 hover:underline">Refunds</Link>
        </nav>
      </div>
    </footer>
  );
}
