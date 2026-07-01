"use client";

// 캐릭터 말풍선
export default function PetSpeechBubble({
  text,
  accent = "cream",
}: {
  text: string;
  accent?: "toto" | "ppuni" | "cream";
}) {
  const border =
    accent === "toto"
      ? "border-toto"
      : accent === "ppuni"
      ? "border-ppuni"
      : "border-cream-deep";
  return (
    <div
      className={`relative max-w-[10rem] rounded-2xl border-2 ${border} bg-card px-3 py-1.5 text-center text-xs font-medium leading-snug text-cocoa shadow-sm animate-pop`}
    >
      {text}
      <span
        className={`absolute -bottom-[7px] left-1/2 h-3 w-3 -translate-x-1/2 rotate-45 border-b-2 border-r-2 ${border} bg-card`}
        aria-hidden
      />
    </div>
  );
}
