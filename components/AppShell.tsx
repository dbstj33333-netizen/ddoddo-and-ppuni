"use client";

// 앱 셸: 데스크톱에서는 폰 프레임 느낌, 모바일에서는 전체화면.
// 내부 스크롤 + 하단 고정 내비 구조로 네이티브 앱처럼 동작한다.
import { useState } from "react";
import { useGame } from "@/context/GameContext";
import BottomNavigation, { type TabKey } from "./BottomNavigation";
import Onboarding from "./Onboarding";
import Toast from "./Toast";
import HomeScreen from "./screens/HomeScreen";
import SettingsScreen from "./screens/SettingsScreen";

export default function AppShell() {
  const { ready, state, finishOnboarding } = useGame();
  const [tab, setTab] = useState<TabKey>("home");

  return (
    <div className="flex min-h-dvh w-full justify-center bg-cream">
      {/* 실제 앱 화면: 모든 기기에서 화면을 꽉 채우는 반응형 컬럼.
          배경(잔디/하늘)을 화면 전체에 깔아 주변 여백을 없앤다.
          transform 으로 내부 fixed 오버레이를 이 컬럼 안에 가둔다. */}
      <div
        className="relative flex h-dvh w-full max-w-[520px] flex-col overflow-hidden bg-cream bg-cover bg-center transform-gpu"
        style={{
          transform: "translateZ(0)",
          backgroundImage: "url('/images/room-bg.png')",
        }}
      >
        {!ready ? (
          <div className="grid flex-1 place-items-center bg-cream">
            <div className="flex flex-col items-center gap-3">
              <div className="flex gap-2 text-5xl">
                <span className="animate-bob">🐶</span>
                <span
                  className="animate-bob"
                  style={{ animationDelay: "0.35s" }}
                >
                  🐱
                </span>
              </div>
              <p className="font-display text-lg text-cocoa">또또랑 쁘니</p>
            </div>
          </div>
        ) : (
          <>
            <Toast />

            <main
              className="min-h-0 flex-1"
              style={{ paddingTop: "env(safe-area-inset-top)" }}
            >
              <div key={tab} className="h-full animate-fade-in">
                {tab === "home" && <HomeScreen />}
                {tab === "settings" && <SettingsScreen />}
              </div>
            </main>

            <BottomNavigation active={tab} onChange={setTab} />

            {!state.onboarded && <Onboarding onStart={finishOnboarding} />}
          </>
        )}
      </div>
    </div>
  );
}
