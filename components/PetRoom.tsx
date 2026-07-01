"use client";

// 캐릭터 스테이지 (배경은 화면 전체를 채우므로 여기서는 투명).
import { useEffect, useState } from "react";
import type { PetImageState } from "@/lib/constants";
import type { Pet, PetId } from "@/lib/types";
import PettingInteraction from "./PettingInteraction";
import PetSpeechBubble from "./PetSpeechBubble";

// 가끔 지나가는 노란 나비
function Butterfly() {
  return (
    <div className="pointer-events-none absolute z-10 animate-butterfly" aria-hidden>
      <div className="flex items-center gap-[2px]">
        <div className="origin-right animate-wing flex flex-col gap-[1px]">
          <span className="block h-2.5 w-3 rounded-full bg-[#f4cf5a]" />
          <span className="block h-2 w-2.5 rounded-full bg-[#efb63c]" />
        </div>
        <span className="block h-3.5 w-[3px] rounded-full bg-[#7a5c2e]" />
        <div className="origin-left animate-wing flex flex-col gap-[1px]">
          <span className="block h-2.5 w-3 rounded-full bg-[#f4cf5a]" />
          <span className="block h-2 w-2.5 rounded-full bg-[#efb63c]" />
        </div>
      </div>
    </div>
  );
}

export default function PetRoom({
  pets,
  selectedId,
  speech,
  imageState,
  onStroke,
}: {
  pets: Pet[];
  selectedId: PetId;
  speech: string;
  imageState?: PetImageState;
  onStroke: (id: PetId) => void;
}) {
  const pet = pets.find((p) => p.id === selectedId) ?? pets[0];
  const accent = pet.id === "toto" ? "toto" : "ppuni";

  // 가끔 한 번씩 나비를 날린다 (9~21초 간격)
  const [flyKey, setFlyKey] = useState(0);
  useEffect(() => {
    let timer = 0;
    const schedule = () => {
      timer = window.setTimeout(() => {
        setFlyKey((k) => k + 1);
        schedule();
      }, 9000 + Math.random() * 12000);
    };
    schedule();
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <div className="relative flex h-full min-h-0 flex-col items-center justify-end pb-10 pt-4">
      {/* 가끔 지나가는 노란 나비 */}
      {flyKey > 0 && <Butterfly key={flyKey} />}

      {/* 말풍선 + 캐릭터 (화면 크기에 맞춰 유동) */}
      <div className="relative flex min-h-0 flex-col items-center">
        <div className="mb-1">
          <PetSpeechBubble text={speech} accent={accent} />
        </div>
        <PettingInteraction
          pet={pet}
          sizeCss="min(66vw, 36vh, 290px)"
          showName={false}
          imageState={imageState}
          onStroke={onStroke}
        />
      </div>
    </div>
  );
}
