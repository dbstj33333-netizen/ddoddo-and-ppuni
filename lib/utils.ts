// 소소한 공용 유틸 (날짜 키, 시간 포맷, 아이디, 랜덤)

let idCounter = 0;

// 로그용 고유 아이디 (시간 + 카운터로 충돌 방지)
export function uid(): string {
  idCounter = (idCounter + 1) % 100000;
  return `${Date.now().toString(36)}-${idCounter.toString(36)}`;
}

// 로컬 기준 YYYY-MM-DD
export function dateKey(d: Date | string | number = new Date()): string {
  const date = typeof d === "object" ? d : new Date(d);
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

// "오후 3:20" 형태
export function formatClock(d: Date | string | number): string {
  const date = typeof d === "object" ? d : new Date(d);
  let h = date.getHours();
  const m = String(date.getMinutes()).padStart(2, "0");
  const ampm = h < 12 ? "오전" : "오후";
  h = h % 12;
  if (h === 0) h = 12;
  return `${ampm} ${h}:${m}`;
}

// "3분 12초" / "45초" 형태
export function formatDuration(sec: number): string {
  const s = Math.max(0, Math.floor(sec));
  const m = Math.floor(s / 60);
  const rest = s % 60;
  if (m <= 0) return `${rest}초`;
  if (rest === 0) return `${m}분`;
  return `${m}분 ${rest}초`;
}

export function randomItem<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// 두 날짜 키가 연속된 날인지
export function isYesterday(prev: string, today: string): boolean {
  const p = new Date(prev + "T00:00:00");
  const t = new Date(today + "T00:00:00");
  const diff = Math.round((t.getTime() - p.getTime()) / 86400000);
  return diff === 1;
}
