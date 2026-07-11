export const STATUS_STYLES: Record<string, string> = {
  received: "bg-amber-100 text-amber-800",
  reviewing: "bg-blue-100 text-blue-800",
  completed: "bg-purple-100 text-purple-800",
  delivered: "bg-green-100 text-green-800",
};

export const PAYMENT_STYLES: Record<string, string> = {
  unpaid: "bg-red-100 text-red-700",
  paid: "bg-green-100 text-green-700",
  waived: "bg-neutral-200 text-neutral-700",
};

export function formatDate(d: string | null): string {
  if (!d) return "—";
  return new Date(d).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatDateTime(d: string | null): string {
  if (!d) return "—";
  return new Date(d).toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export const FOLLOW_UP_STYLES: Record<string, string> = {
  new: "bg-amber-100 text-amber-800",
  contacted: "bg-blue-100 text-blue-800",
  scheduled: "bg-purple-100 text-purple-800",
  done: "bg-green-100 text-green-800",
};
