"use client";

import { useRef, useState, useTransition } from "react";
import Link from "next/link";
import { updateFollowUpStatusAction, addFollowUpNoteAction } from "./actions";
import { FOLLOW_UP_STYLES, formatDateTime } from "@/lib/db/format";
import type { FollowUpStatus, FollowUpNote } from "@/lib/db/types";

const STATUS_OPTIONS: FollowUpStatus[] = ["new", "contacted", "scheduled", "done"];

export function FollowUpCard({
  submissionId,
  referenceCode,
  customerName,
  reportType,
  rating,
  feedbackText,
  status,
  notes,
}: {
  submissionId: string;
  referenceCode: string;
  customerName: string;
  reportType: string | null;
  rating: number | null;
  feedbackText: string | null;
  status: FollowUpStatus;
  notes: FollowUpNote[];
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [noteText, setNoteText] = useState("");
  const [isAddingNote, startAddingNote] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-5">
      <div className="flex items-start justify-between gap-3">
        <Link
          href={`/dashboard/${submissionId}`}
          className="font-mono text-sm text-teal-700 hover:underline shrink-0"
        >
          {referenceCode}
        </Link>
        <div className="flex gap-1.5 shrink-0">
          {STATUS_OPTIONS.map((opt) => (
            <button
              key={opt}
              disabled={isPending || opt === status}
              onClick={() => {
                setError(null);
                startTransition(async () => {
                  const result = await updateFollowUpStatusAction(submissionId, opt);
                  if (result.error) setError(result.error);
                });
              }}
              className={`rounded-full px-2.5 py-1 text-xs font-medium border transition-colors ${
                opt === status
                  ? `${FOLLOW_UP_STYLES[opt]} border-transparent`
                  : "bg-white text-neutral-500 border-neutral-300 hover:bg-neutral-50"
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>
      <p className="mt-2 font-semibold text-neutral-900">{customerName}</p>
      <p className="text-xs text-neutral-500">{reportType ?? "—"}</p>

      {(rating || feedbackText) && (
        <div className="mt-3 rounded-lg bg-neutral-50 px-3 py-2 text-sm text-neutral-600">
          {rating && <span className="text-amber-500">{"★".repeat(rating)}{"☆".repeat(5 - rating)}</span>}
          {feedbackText && <p className="mt-1 italic">&ldquo;{feedbackText}&rdquo;</p>}
        </div>
      )}

      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}

      <div className="mt-4 border-t border-neutral-100 pt-3">
        <p className="text-xs font-medium text-neutral-500 mb-2">Notes</p>
        {notes.length === 0 && (
          <p className="text-xs text-neutral-400 mb-2">No notes yet.</p>
        )}
        <ul className="space-y-2 mb-3">
          {notes.map((n) => (
            <li key={n.id} className="rounded-md bg-neutral-50 px-3 py-2 text-sm text-neutral-700">
              <p>{n.note}</p>
              <p className="mt-1 text-xs text-neutral-400">
                {n.author} · {formatDateTime(n.created_at)}
              </p>
            </li>
          ))}
        </ul>
        <form
          ref={formRef}
          onSubmit={(e) => {
            e.preventDefault();
            if (!noteText.trim()) return;
            startAddingNote(async () => {
              const result = await addFollowUpNoteAction(submissionId, noteText);
              if (!result.error) {
                setNoteText("");
              } else {
                setError(result.error);
              }
            });
          }}
          className="flex gap-2"
        >
          <input
            type="text"
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            placeholder="Add a note (e.g. called, left voicemail, booked for Tue 3pm)"
            className="flex-1 rounded-md border border-neutral-300 px-3 py-1.5 text-sm"
          />
          <button
            type="submit"
            disabled={isAddingNote || !noteText.trim()}
            className="rounded-md bg-neutral-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-neutral-800 disabled:opacity-60"
          >
            {isAddingNote ? "Adding…" : "Add"}
          </button>
        </form>
      </div>
    </div>
  );
}
