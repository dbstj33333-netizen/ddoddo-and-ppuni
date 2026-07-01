"use client";

// 수면 화면 (어두운 방). 잠든 시간/잔 시간/예상 회복 체력 표시 + 깨우기.
import { useEffect, useState } from "react";
import { SLEEP_ENERGY_RECOVERY_PER_MIN } from "@/lib/constants";
import { clamp } from "@/lib/status";
import type { Pet } from "@/lib/types";
import { formatClock, formatDuration } from "@/lib/utils";
import PetCharacter from "./PetCharacter";

export default function SleepMode({
  pet,
  onWake,
}: {
  pet: Pet;
  onWake: () => void;
}) {
  const [nowMs, setNowMs] = useState(() => Date.now());

  useEffect(() => {
    const id = window.setInterval(() => setNowMs(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const startMs = pet.sleepStartedAt
    ? new Date(pet.sleepStartedAt).getTime()
    : nowMs;
  const sleptSec = Math.max(0, Math.floor((nowMs - startMs) / 1000));

  // 실시간 회복 체력 (마지막 저장값 + 경과)
  const lastMs = new Date(pet.lastUpdatedAt).getTime();
  const liveEnergy = clamp(
    pet.energy + ((nowMs - lastMs) / 60000) * SLEEP_ENERGY_RECOVERY_PER_MIN
  );
  const remainMin = Math.max(
    0,
    Math.ceil((100 - liveEnergy) / SLEEP_ENERGY_RECOVERY_PER_MIN)
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-5">
      <div
        className="absolute inset-0 bg-[#232134]/85 backdrop-blur-sm animate-fade-in"
        aria-hidden
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`${pet.name} 수면 중`}
        className="relative w-full max-w-sm rounded-3xl bg-[#2c2a40] p-6 text-center text-[#e8e5f5] shadow-2xl animate-slide-up"
      >
        <p className="text-sm text-[#b6b1d4]">쉿, 조용히…</p>
        <h2 className="font-display text-2xl text-white">
          {pet.name}가 자고 있어요
        </h2>

        <div className="my-4 grid place-items-center">
          <div className="rounded-3xl bg-white/5 p-4">
            <PetCharacter pet={pet} state="sleeping" size="lg" />
          </div>
        </div>

        <dl className="space-y-2 rounded-2xl bg-white/5 px-4 py-3 text-left text-sm">
          <Row label="잠든 시간" value={formatClock(startMs)} />
          <Row label="현재까지 잔 시간" value={formatDuration(sleptSec)} />
          <Row
            label="현재 체력"
            value={`${Math.round(liveEnergy)} / 100`}
          />
          <Row
            label="예상 완전 회복까지"
            value={remainMin <= 0 ? "회복 완료" : `약 ${remainMin}분`}
          />
        </dl>

        <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-toto transition-[width] duration-1000 ease-linear"
            style={{ width: `${liveEnergy}%` }}
          />
        </div>

        <button
          type="button"
          onClick={onWake}
          className="no-tap-highlight mt-5 w-full rounded-2xl bg-butter py-3 text-sm font-bold text-cocoa transition active:scale-95"
        >
          ☀️ 깨우기
        </button>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-[#b6b1d4]">{label}</dt>
      <dd className="font-bold text-white tabular-nums">{value}</dd>
    </div>
  );
}
