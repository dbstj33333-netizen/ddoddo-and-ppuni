"use client";

// 아늑한 방. 한 화면에 선택된 한 마리만 보여준다.
// 동물 전환은 상단 토글(PetSelector)로만 한다.
import type { PetImageState } from "@/lib/constants";
import type { Pet, PetId } from "@/lib/types";
import PettingInteraction from "./PettingInteraction";
import PetSpeechBubble from "./PetSpeechBubble";

const BG: Record<"morning" | "day" | "night", string> = {
  morning: "from-butter-soft via-cream to-sage/30",
  day: "from-toto-soft/60 via-cream to-butter-soft",
  night: "from-[#c9d3ea] via-[#e7e3f0] to-[#f3ecdd]",
};

export default function PetRoom({
  pets,
  selectedId,
  speech,
  imageState,
  timeOfDay,
  onSelect,
  onStroke,
}: {
  pets: Pet[];
  selectedId: PetId;
  speech: string;
  imageState?: PetImageState;
  timeOfDay: "morning" | "day" | "night";
  onSelect: (id: PetId) => void;
  onStroke: (id: PetId) => void;
}) {
  const pet = pets.find((p) => p.id === selectedId) ?? pets[0];
  const accent = pet.id === "toto" ? "toto" : "ppuni";

  return (
    <div
      className={`relative flex h-full min-h-0 flex-col overflow-hidden rounded-[2rem] border border-cream-deep bg-gradient-to-b ${BG[timeOfDay]} px-4 pb-3 pt-3 shadow-[0_12px_34px_-16px_rgba(92,68,51,0.5)]`}
    >
      {/* 방 소품 */}
      <div
        className="pointer-events-none absolute right-4 top-4 grid h-11 w-11 place-items-center rounded-2xl border-2 border-white/70 bg-white/40 text-xl"
        aria-hidden
      >
        {timeOfDay === "night" ? "🌙" : "☀️"}
      </div>
      <div
        className="pointer-events-none absolute left-4 top-5 text-xl opacity-70"
        aria-hidden
      >
        🪴
      </div>
      <div
        className="pointer-events-none absolute inset-x-8 bottom-6 h-16 rounded-[50%] bg-apricot/20 blur-sm"
        aria-hidden
      />

      {/* 말풍선 */}
      <div className="relative flex shrink-0 justify-center pt-1">
        <PetSpeechBubble text={speech} accent={accent} />
      </div>

      {/* 중앙: 단일 캐릭터 (양옆 버튼 없음) */}
      <div className="relative flex flex-1 items-center justify-center">
        <PettingInteraction
          pet={pet}
          selected
          size="xl"
          imageState={imageState}
          onSelect={onSelect}
          onStroke={onStroke}
        />
      </div>
    </div>
  );
}
