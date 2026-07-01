"use client";

// 아늑한 방 = 화면의 메인. 선택된 한 마리를 크게 중앙에 보여준다.
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
      className={`relative flex h-full min-h-0 flex-col items-center justify-center overflow-hidden rounded-[2rem] border border-cream-deep bg-gradient-to-b ${BG[timeOfDay]} px-4 py-4 shadow-[0_12px_34px_-16px_rgba(92,68,51,0.5)]`}
    >
      {/* 방 소품 */}
      <div
        className="pointer-events-none absolute left-5 top-16 text-2xl opacity-70"
        aria-hidden
      >
        🪴
      </div>
      <div
        className="pointer-events-none absolute right-6 top-20 text-xl opacity-60"
        aria-hidden
      >
        🧸
      </div>
      <div
        className="pointer-events-none absolute inset-x-10 bottom-8 h-16 rounded-[50%] bg-apricot/20 blur-md"
        aria-hidden
      />

      {/* 중앙: 말풍선 + 큰 캐릭터 (메인) */}
      <div className="relative flex flex-col items-center">
        <div className="mb-1">
          <PetSpeechBubble text={speech} accent={accent} />
        </div>
        <PettingInteraction
          pet={pet}
          selected
          size="xl"
          showName={false}
          imageState={imageState}
          onSelect={onSelect}
          onStroke={onStroke}
        />
      </div>
    </div>
  );
}
