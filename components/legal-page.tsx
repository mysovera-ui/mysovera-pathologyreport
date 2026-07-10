import Link from "next/link";

export function LegalPage({
  title,
  lastUpdated,
  children,
}: {
  title: string;
  lastUpdated: string;
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen bg-neutral-50 py-16 px-6">
      <div className="max-w-2xl mx-auto">
        <Link href="/" className="text-sm text-teal-700 hover:underline">
          ← Home
        </Link>
        <h1 className="mt-4 text-3xl font-bold text-neutral-900">{title}</h1>
        <p className="mt-1 text-sm text-neutral-400">Last updated: {lastUpdated}</p>

        <div className="mt-8 space-y-6 text-sm leading-relaxed text-neutral-700 [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:text-neutral-900 [&_h2]:mt-8 [&_h2]:mb-2 [&_p]:mb-3 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1 [&_ul]:mb-3 [&_a]:text-teal-700 [&_a]:hover:underline [&_strong]:text-neutral-900">
          {children}
        </div>
      </div>
    </main>
  );
}
