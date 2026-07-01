"use client";

// 아늑한 방 = 화면의 메인. 하늘·잔디 배경 위에 선택된 한 마리를 크게 보여준다.
import type { PetImageState } from "@/lib/constants";
import type { Pet, PetId } from "@/lib/types";
import PettingInteraction from "./PettingInteraction";
import PetSpeechBubble from "./PetSpeechBubble";

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
      className="relative flex h-full min-h-0 flex-col items-center justify-end overflow-hidden rounded-[2rem] border border-cream-deep bg-cover bg-center pb-16 pt-6 shadow-[0_12px_34px_-16px_rgba(92,68,51,0.5)]"
      style={{ backgroundImage: "url('/images/room-bg.png')" }}
    >
      {/* 밤에는 살짝 어둡게 */}
      {timeOfDay === "night" && (
        <div
          className="pointer-events-none absolute inset-0 bg-[#2c2a40]/25"
          aria-hidden
        />
      )}

      {/* 중앙 하단: 말풍선 + 큰 캐릭터 (메인) */}
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
