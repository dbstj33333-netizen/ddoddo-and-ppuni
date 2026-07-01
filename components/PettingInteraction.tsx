"use client";

// 캐릭터를 문지르면(드래그) 쓰다듬기가 발동하고 하트가 튀어나온다.
// 짧게 탭하면 해당 동물을 선택한다. 포인터 이벤트로 터치/마우스 모두 지원.
import { useRef, useState } from "react";
import type { PetImageState } from "@/lib/constants";
import type { Pet, PetId } from "@/lib/types";
import PetCharacter from "./PetCharacter";

const STROKE_DISTANCE = 34; // 이 거리 이상 문지르면 쓰다듬기 1회
const TAP_MOVE_TOLERANCE = 10; // 이 이하로 움직이면 탭(선택)으로 간주

type Heart = { id: number; x: number; y: number; emoji: string };
const SPARKLES = ["💗", "✨", "💛", "⭐"];

export default function PettingInteraction({
  pet,
  selected,
  imageState,
  size = "lg",
  showName = true,
  onSelect,
  onStroke,
}: {
  pet: Pet;
  selected: boolean;
  imageState?: PetImageState;
  size?: "md" | "lg" | "xl";
  showName?: boolean;
  onSelect: (id: PetId) => void;
  onStroke: (id: PetId) => void;
}) {
  const [hearts, setHearts] = useState<Heart[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const pressing = useRef(false);
  const lastPos = useRef<{ x: number; y: number } | null>(null);
  const accumulated = useRef(0);
  const totalMove = useRef(0);
  const heartId = useRef(0);

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

    if (!pet.isSleeping && accumulated.current >= STROKE_DISTANCE) {
      accumulated.current = 0;
      onStroke(pet.id);
      spawnHeart(e.clientX, e.clientY);
    }
  };

  const endPress = () => {
    if (!pressing.current) return;
    pressing.current = false;
    // 거의 안 움직였으면 탭 = 선택
    if (totalMove.current <= TAP_MOVE_TOLERANCE) {
      onSelect(pet.id);
    }
    lastPos.current = null;
  };

  return (
    <div
      ref={containerRef}
      role="button"
      tabIndex={0}
      aria-pressed={selected}
      aria-label={`${pet.name} 선택하고 쓰다듬기`}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endPress}
      onPointerCancel={endPress}
      onPointerLeave={endPress}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect(pet.id);
        }
      }}
      className="no-tap-highlight relative rounded-3xl p-2"
      style={{ touchAction: "none" }}
    >
      <PetCharacter pet={pet} state={imageState} size={size} />

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
