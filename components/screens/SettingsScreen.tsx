"use client";

// 설정: 사운드/진동/알림 토글, 이름 변경, 데이터 초기화, 앱 정보
import { useState } from "react";
import { useGame } from "@/context/GameContext";
import type { Settings } from "@/lib/types";
import ConfirmModal from "../ConfirmModal";

export default function SettingsScreen() {
  const { state, setSetting, renamePet, resetGame, playSfx } = useGame();
  const [names, setNames] = useState({
    toto: state.pets.toto.name,
    ppuni: state.pets.ppuni.name,
  });
  const [confirmReset, setConfirmReset] = useState(false);

  const toggles: { key: keyof Settings; label: string; desc: string }[] = [
    { key: "bgm", label: "배경음", desc: "잔잔한 배경 음악" },
    { key: "sfx", label: "효과음", desc: "버튼·상호작용 소리" },
    { key: "vibration", label: "진동 효과", desc: "터치 시 가벼운 진동" },
    { key: "notifications", label: "알림", desc: "돌봄 관련 안내 표시" },
  ];

  return (
    <div className="space-y-5">
      <header>
        <h1 className="font-display text-xl text-cocoa">설정</h1>
        <p className="text-xs text-cocoa-soft">앱을 내 취향에 맞게 바꿔보세요.</p>
      </header>

      {/* 토글 */}
      <section className="rounded-3xl border border-cream-deep bg-card p-2 shadow-sm">
        {toggles.map((t) => (
          <label
            key={t.key}
            className="flex cursor-pointer items-center justify-between gap-3 rounded-2xl px-3 py-3"
          >
            <span>
              <span className="block text-sm font-bold text-cocoa">
                {t.label}
              </span>
              <span className="block text-xs text-cocoa-faint">{t.desc}</span>
            </span>
            <Toggle
              checked={state.settings[t.key]}
              ariaLabel={t.label}
              onChange={(v) => {
                setSetting(t.key, v);
                if (v && (t.key === "sfx" || t.key === "bgm")) playSfx("tap");
              }}
            />
          </label>
        ))}
      </section>

      {/* 이름 변경 */}
      <section className="rounded-3xl border border-cream-deep bg-card p-4 shadow-sm">
        <h2 className="mb-3 font-display text-base text-cocoa">동물 이름 변경</h2>
        <div className="space-y-3">
          {(["toto", "ppuni"] as const).map((id) => (
            <div key={id} className="flex items-center gap-2">
              <span
                className={`grid h-9 w-9 shrink-0 place-items-center rounded-full text-white ${
                  id === "toto" ? "bg-toto" : "bg-ppuni"
                }`}
                aria-hidden
              >
                {id === "toto" ? "🐶" : "🐱"}
              </span>
              <input
                type="text"
                value={names[id]}
                maxLength={12}
                aria-label={`${id === "toto" ? "강아지" : "고양이"} 이름`}
                onChange={(e) =>
                  setNames((prev) => ({ ...prev, [id]: e.target.value }))
                }
                className="min-w-0 flex-1 rounded-xl border border-cream-deep bg-cream px-3 py-2 text-sm text-cocoa outline-none focus:border-sage-deep"
              />
              <button
                type="button"
                onClick={() => renamePet(id, names[id])}
                className="no-tap-highlight rounded-xl bg-sage-deep px-3 py-2 text-sm font-bold text-white transition active:scale-95"
              >
                저장
              </button>
            </div>
          ))}
        </div>
        <p className="mt-2 text-xs text-cocoa-faint">
          기본값은 또또와 쁘니예요. 최대 12자까지 지정할 수 있어요.
        </p>
      </section>

      {/* 데이터 초기화 */}
      <section className="rounded-3xl border border-cream-deep bg-card p-4 shadow-sm">
        <h2 className="mb-1 font-display text-base text-cocoa">데이터 초기화</h2>
        <p className="mb-3 text-xs text-cocoa-soft">
          모든 돌봄 기록과 동물 상태를 처음 상태로 되돌려요.
        </p>
        <button
          type="button"
          onClick={() => setConfirmReset(true)}
          className="no-tap-highlight w-full rounded-2xl bg-apricot/25 py-3 text-sm font-bold text-apricot-deep transition active:scale-95"
        >
          데이터 초기화
        </button>
      </section>

      {/* 앱 정보 */}
      <section className="rounded-3xl border border-cream-deep bg-card p-4 shadow-sm">
        <h2 className="mb-1 font-display text-base text-cocoa">앱 정보</h2>
        <p className="text-sm text-cocoa">또또랑 쁘니 · v1.0</p>
        <p className="mt-1 text-xs text-cocoa-faint">
          또또와 쁘니를 돌보는 따뜻한 반려동물 육성 앱. 모든 데이터는 이 기기의
          브라우저에만 저장돼요.
        </p>
      </section>

      <ConfirmModal
        open={confirmReset}
        title="데이터 초기화"
        message={"모든 돌봄 기록과 동물 상태가 초기화됩니다.\n정말 초기화할까요?"}
        confirmLabel="초기화"
        cancelLabel="취소"
        tone="danger"
        onConfirm={() => {
          resetGame();
          setNames({ toto: "또또", ppuni: "쁘니" });
          setConfirmReset(false);
        }}
        onCancel={() => setConfirmReset(false)}
      />
    </div>
  );
}

function Toggle({
  checked,
  onChange,
  ariaLabel,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  ariaLabel: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      onClick={() => onChange(!checked)}
      className={`no-tap-highlight relative h-7 w-12 shrink-0 rounded-full transition ${
        checked ? "bg-sage-deep" : "bg-cream-deep"
      }`}
    >
      <span
        className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-all ${
          checked ? "left-6" : "left-1"
        }`}
      />
    </button>
  );
}
