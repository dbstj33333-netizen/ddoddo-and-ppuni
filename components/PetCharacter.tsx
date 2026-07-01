"use client";

// 캐릭터 렌더링. 이미지가 있으면 이미지를, 없으면 이모지 플레이스홀더를 보여준다.
// state 값으로 애니메이션이 달라진다. 이미지 파일만 교체하면 그대로 반영된다.
import { useEffect, useState } from "react";
import type { PetImageState } from "@/lib/constants";
import { petImagePath } from "@/lib/constants";
import { computeMood, fallbackEmoji, moodToImageState } from "@/lib/mood";
import type { Pet } from "@/lib/types";

const SIZE_PX: Record<"sm" | "md" | "lg" | "xl", number> = {
  sm: 84,
  md: 132,
  lg: 168,
  xl: 232,
};

export default function PetCharacter({
  pet,
  state,
  size = "md",
}: {
  pet: Pet;
  state?: PetImageState;
  size?: "sm" | "md" | "lg" | "xl";
}) {
  const mood = computeMood(pet);
  const effectiveState: PetImageState = state ?? moodToImageState(mood);
  const [imgOk, setImgOk] = useState(true);
  const px = SIZE_PX[size];

  // 상태가 바뀌면 이미지 재시도
  useEffect(() => {
    setImgOk(true);
  }, [effectiveState, pet.id]);

  // 바닥에 앉은 느낌: 위아래로 떠다니지 않고 아래를 고정한 채 숨만 쉰다.
  const anim =
    effectiveState === "sleeping"
      ? ""
      : effectiveState === "eating"
      ? "animate-eat"
      : "animate-breathe-ground";

  return (
    <div
      className="relative grid place-items-end justify-items-center"
      style={{ width: px, height: px }}
    >
      {/* 바닥 그림자 (앉아 있는 느낌) */}
      <div
        className="absolute bottom-1 h-3 rounded-full bg-cocoa/20 blur-[2px]"
        style={{ width: px * 0.5 }}
        aria-hidden
      />

      <div
        className={`relative origin-bottom ${anim}`}
        style={{ width: px, height: px }}
      >
        {imgOk ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={petImagePath(pet.id, effectiveState)}
            alt={`${pet.name} (${pet.species === "dog" ? "강아지" : "고양이"})`}
            width={px}
            height={px}
            draggable={false}
            onError={() => setImgOk(false)}
            className="h-full w-full select-none object-contain"
          />
        ) : (
          // 이미지가 없을 때 대체 UI (앱이 깨지지 않도록)
          <div
            role="img"
            aria-label={`${pet.name} (${
              pet.species === "dog" ? "강아지" : "고양이"
            })`}
            className="grid h-full w-full place-items-center"
            style={{ fontSize: px * 0.55 }}
          >
            <span className="select-none leading-none">
              {fallbackEmoji(pet, mood)}
            </span>
          </div>
        )}
      </div>

      {/* 잠잘 때 Z 표시 */}
      {effectiveState === "sleeping" && (
        <>
          <span
            className="pointer-events-none absolute right-1 top-2 text-lg font-bold text-toto animate-zzz"
            aria-hidden
          >
            Z
          </span>
          <span
            className="pointer-events-none absolute right-3 top-3 text-sm font-bold text-toto animate-zzz"
            style={{ animationDelay: "0.8s" }}
            aria-hidden
          >
            z
          </span>
        </>
      )}
    </div>
  );
}
