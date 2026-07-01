"use client";

// 캐릭터 렌더링. 요청 상태 이미지가 없으면 '기본' 이미지로, 그것도 없으면 이모지로 대체.
// 이렇게 하면 밥주기(먹는 이미지 없음) 등에서 이모지가 잠깐 튀는 현상이 없다.
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

// 로드 실패한 이미지 경로를 앱 전역에 기억 (한 번 404면 다시 시도하지 않아 깜빡임 방지)
const failedImages = new Set<string>();

export default function PetCharacter({
  pet,
  state,
  size = "md",
  sizeCss,
  patSeed = 0,
}: {
  pet: Pet;
  state?: PetImageState;
  size?: "sm" | "md" | "lg" | "xl";
  sizeCss?: string; // 지정 시 반응형 CSS 크기 사용 (예: "min(58vw,30vh,240px)")
  patSeed?: number;
}) {
  const mood = computeMood(pet);
  const effectiveState: PetImageState = state ?? moodToImageState(mood);
  const px = SIZE_PX[size];
  const dim = sizeCss ?? `${px}px`;
  const dimStyle = { width: dim, height: dim } as const;
  // 실패 캐시가 갱신될 때 강제 리렌더
  const [, bump] = useState(0);

  // 쓰다듬을 때 잠깐 머리가 눌리는 효과
  const [squishing, setSquishing] = useState(false);
  useEffect(() => {
    if (!patSeed) return;
    setSquishing(true);
    const t = window.setTimeout(() => setSquishing(false), 340);
    return () => window.clearTimeout(t);
  }, [patSeed]);

  // 표시할 이미지 결정: 요청 상태 → 기본 → (둘 다 없으면) 이모지
  const primarySrc = petImagePath(pet.id, effectiveState);
  const defaultSrc = petImagePath(pet.id, "default");
  let src: string | null;
  if (!failedImages.has(primarySrc)) src = primarySrc;
  else if (!failedImages.has(defaultSrc)) src = defaultSrc;
  else src = null;

  // 바닥에 앉은 느낌: 위아래로 떠다니지 않고 아래를 고정한 채 숨만 쉰다.
  // 쓰다듬는 중엔 눌리는(squish) 애니메이션 우선.
  const anim = squishing
    ? "animate-squish"
    : effectiveState === "sleeping"
    ? ""
    : effectiveState === "eating"
    ? "animate-eat"
    : "animate-breathe-ground";

  return (
    <div
      className="relative grid place-items-end justify-items-center"
      style={dimStyle}
    >
      {/* 바닥 그림자 (앉아 있는 느낌) */}
      <div
        className="absolute bottom-1 h-3 w-1/2 rounded-full bg-cocoa/20 blur-[2px]"
        aria-hidden
      />

      <div className={`relative origin-bottom ${anim}`} style={dimStyle}>
        {src ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            key={src}
            src={src}
            alt={`${pet.name} (${pet.species === "dog" ? "강아지" : "고양이"})`}
            draggable={false}
            onError={() => {
              failedImages.add(src as string);
              bump((n) => n + 1);
            }}
            className="h-full w-full select-none object-contain"
          />
        ) : (
          // 이미지가 하나도 없을 때만 이모지 대체 (앱이 깨지지 않도록)
          <div
            role="img"
            aria-label={`${pet.name} (${
              pet.species === "dog" ? "강아지" : "고양이"
            })`}
            className="grid h-full w-full place-items-center"
            style={{ fontSize: sizeCss ? "clamp(2.5rem, 20vw, 7rem)" : px * 0.55 }}
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
