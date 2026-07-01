"use client";

// 아늑한 방 = 화면의 메인. 하늘·잔디 배경 위에 선택된 한 마리를 크게 보여준다.
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
  timeOfDay,
  onStroke,
}: {
  pets: Pet[];
  selectedId: PetId;
  speech: string;
  imageState?: PetImageState;
  timeOfDay: "morning" | "day" | "night";
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
    <div
      className="relative flex h-full min-h-0 flex-col items-center justify-end overflow-hidden rounded-[2rem] border border-cream-deep bg-cover bg-center pb-14 pt-6 shadow-[0_12px_34px_-16px_rgba(92,68,51,0.5)]"
      style={{ backgroundImage: "url('/images/room-bg.png')" }}
    >
      {/* 밤에는 살짝 어둡게 */}
      {timeOfDay === "night" && (
        <div
          className="pointer-events-none absolute inset-0 bg-[#2c2a40]/25"
          aria-hidden
        />
      )}

      {/* 가끔 지나가는 노란 나비 */}
      {flyKey > 0 && <Butterfly key={flyKey} />}

      {/* 중앙 하단: 말풍선 + 캐릭터 (화면 크기에 맞춰 유동) */}
      <div className="relative flex min-h-0 flex-col items-center">
        <div className="mb-1">
          <PetSpeechBubble text={speech} accent={accent} />
        </div>
        <PettingInteraction
          pet={pet}
          sizeCss="min(82vw, 44vh, 360px)"
          showName={false}
          imageState={imageState}
          onStroke={onStroke}
        />
      </div>
    </div>
  );
}
