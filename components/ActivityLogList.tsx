"use client";

// 최근 활동 로그 (시간순)
import type { ActivityLog, ActivityType, PetId } from "@/lib/types";
import { formatClock } from "@/lib/utils";

const TYPE_EMOJI: Record<ActivityType, string> = {
  pet: "🤲",
  meal: "🍚",
  snack: "🍪",
  sleep: "🌙",
  walk: "🦮",
  play: "🧶",
  wash: "🫧",
  photo: "📸",
};

const PET_DOT: Record<PetId, string> = {
  toto: "bg-toto",
  ppuni: "bg-ppuni",
};

export default function ActivityLogList({
  logs,
  emptyText = "아직 기록이 없어요. 또또와 쁘니를 돌봐주세요!",
  limit = 30,
}: {
  logs: ActivityLog[];
  emptyText?: string;
  limit?: number;
}) {
  if (logs.length === 0) {
    return (
      <p className="rounded-2xl bg-cream px-4 py-6 text-center text-sm text-cocoa-soft">
        {emptyText}
      </p>
    );
  }

  return (
    <ul className="space-y-2">
      {logs.slice(0, limit).map((log) => (
        <li
          key={log.id}
          className="flex items-center gap-3 rounded-2xl border border-cream-deep bg-card px-3 py-2.5"
        >
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-cream-deep text-lg">
            {TYPE_EMOJI[log.type]}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm text-cocoa">{log.message}</p>
            <p className="flex items-center gap-1.5 text-xs text-cocoa-faint">
              <span
                className={`inline-block h-2 w-2 rounded-full ${PET_DOT[log.petId]}`}
                aria-hidden
              />
              {formatClock(log.createdAt)}
            </p>
          </div>
        </li>
      ))}
    </ul>
  );
}
