"use client";

// 또또와 쁘니가 함께 있는 아늑한 방. 탭하면 선택, 문지르면 쓰다듬기.
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
  speeches,
  imageStates,
  timeOfDay,
  onSelect,
  onStroke,
}: {
  pets: Pet[];
  selectedId: PetId;
  speeches: Record<PetId, string>;
  imageStates: Partial<Record<PetId, PetImageState>>;
  timeOfDay: "morning" | "day" | "night";
  onSelect: (id: PetId) => void;
  onStroke: (id: PetId) => void;
}) {
  return (
    <div
      className={`relative overflow-hidden rounded-3xl border border-cream-deep bg-gradient-to-b ${BG[timeOfDay]} p-4 shadow-[0_10px_30px_-16px_rgba(92,68,51,0.5)]`}
    >
      {/* 방 소품 (창문/러그 느낌의 단순 장식) */}
      <div
        className="pointer-events-none absolute right-4 top-4 grid h-14 w-14 place-items-center rounded-2xl border-2 border-white/70 bg-white/40 text-2xl"
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

      {/* 바닥(러그) */}
      <div
        className="pointer-events-none absolute inset-x-6 bottom-6 h-20 rounded-[50%] bg-apricot/20 blur-sm"
        aria-hidden
      />

      <div className="relative flex items-end justify-center gap-2 pt-10 pb-2">
        {pets.map((pet) => (
          <div key={pet.id} className="flex flex-col items-center">
            <div className="mb-1 h-12 flex items-end">
              <PetSpeechBubble
                text={speeches[pet.id]}
                accent={pet.id === "toto" ? "toto" : "ppuni"}
              />
            </div>
            <PettingInteraction
              pet={pet}
              selected={pet.id === selectedId}
              imageState={imageStates[pet.id]}
              onSelect={onSelect}
              onStroke={onStroke}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
