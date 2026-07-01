"use client";

// 캐릭터를 탭하거나 문지르면 쓰다듬기가 발동하고 하트가 튀어나온다.
// 포인터 이벤트로 터치/마우스 모두 지원.
import { useRef, useState } from "react";
import type { PetImageState } from "@/lib/constants";
import type { Pet, PetId } from "@/lib/types";
import PetCharacter from "./PetCharacter";

const STROKE_DISTANCE = 34; // 이 거리 이상 문지르면 쓰다듬기 1회
const TAP_MOVE_TOLERANCE = 10; // 이 이하로 움직이면 '탭'으로 간주

type Heart = { id: number; x: number; y: number; emoji: string };
const SPARKLES = ["💗", "✨", "💛", "⭐"];

export default function PettingInteraction({
  pet,
  imageState,
  size = "lg",
  sizeCss,
  showName = true,
  onStroke,
}: {
  pet: Pet;
  imageState?: PetImageState;
  size?: "md" | "lg" | "xl";
  sizeCss?: string;
  showName?: boolean;
  onStroke: (id: PetId) => void;
}) {
  const [hearts, setHearts] = useState<Heart[]>([]);
  const [patSeed, setPatSeed] = useState(0);
  const [hand, setHand] = useState<{ x: number; y: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const pressing = useRef(false);
  const lastPos = useRef<{ x: number; y: number } | null>(null);
  const accumulated = useRef(0);
  const totalMove = useRef(0);
  const heartId = useRef(0);
  const handTimer = useRef(0);

  const accent = pet.id === "toto" ? "toto" : "ppuni";

  const spawnHeart = (clientX: number, clientY: number) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const id = heartId.current++;
    const heart: Heart = {
      id,
      x: clientX - rect.left,
      y: clientY - rect.top,
      emoji: SPARKLES[id % SPARKLES.length],
    };
    setHearts((prev) => [...prev.slice(-6), heart]);
    window.setTimeout(
      () => setHearts((prev) => prev.filter((h) => h.id !== id)),
      1100
    );
  };

  const petOnce = (x: number, y: number) => {
    if (pet.isSleeping) return; // 자는 중엔 반응 없음
    onStroke(pet.id);
    spawnHeart(x, y);
    setPatSeed((s) => s + 1); // 캐릭터 눌리는 효과 트리거
    // 쓰다듬는 손 위치 표시
    const rect = containerRef.current?.getBoundingClientRect();
    if (rect) setHand({ x: x - rect.left, y: y - rect.top });
    window.clearTimeout(handTimer.current);
    handTimer.current = window.setTimeout(() => setHand(null), 450);
  };

  const onPointerDown = (e: React.PointerEvent) => {
    pressing.current = true;
    lastPos.current = { x: e.clientX, y: e.clientY };
    accumulated.current = 0;
    totalMove.current = 0;
    try {
      (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    } catch {
      /* noop */
    }
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!pressing.current || !lastPos.current) return;
    const dx = e.clientX - lastPos.current.x;
    const dy = e.clientY - lastPos.current.y;
    const dist = Math.hypot(dx, dy);
    lastPos.current = { x: e.clientX, y: e.clientY };
    accumulated.current += dist;
    totalMove.current += dist;

    // 문지르는 중: 일정 거리마다 쓰다듬기
    if (accumulated.current >= STROKE_DISTANCE) {
      accumulated.current = 0;
      petOnce(e.clientX, e.clientY);
    }
  };

  const endPress = (e: React.PointerEvent) => {
    if (!pressing.current) return;
    pressing.current = false;
    // 거의 안 움직였으면 '탭' → 쓰다듬기 1회
    if (totalMove.current <= TAP_MOVE_TOLERANCE) {
      petOnce(e.clientX, e.clientY);
    }
    lastPos.current = null;
  };

  return (
    <div
      ref={containerRef}
      role="button"
      tabIndex={0}
      aria-label={`${pet.name} 쓰다듬기`}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endPress}
      onPointerCancel={endPress}
      onPointerLeave={endPress}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          if (!pet.isSleeping) onStroke(pet.id);
        }
      }}
      className="no-tap-highlight relative rounded-3xl p-2"
      style={{ touchAction: "none" }}
    >
      <PetCharacter
        pet={pet}
        state={imageState}
        size={size}
        sizeCss={sizeCss}
        patSeed={patSeed}
      />

      {/* 쓰다듬는 손 */}
      {hand && (
        <span
          className="pointer-events-none absolute z-20 text-3xl animate-hand-rub"
          style={{ left: hand.x, top: hand.y }}
          aria-hidden
        >
          🤚
        </span>
      )}

      {/* 이름표 */}
      {showName && (
        <div className="mt-1 flex justify-center">
          <span
            className={`rounded-full px-3 py-0.5 text-xs font-bold text-white shadow-sm ${
              accent === "toto" ? "bg-toto" : "bg-ppuni"
            }`}
          >
            {pet.name}
          </span>
        </div>
      )}

      {/* 하트/반짝임 이펙트 */}
      {hearts.map((h) => (
        <span
          key={h.id}
          className="pointer-events-none absolute z-10 text-xl animate-float-heart"
          style={{ left: h.x, top: h.y }}
          aria-hidden
        >
          {h.emoji}
        </span>
      ))}
    </div>
  );
}
