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
    <div className="min-h-dvh w-full bg-gradient-to-b from-[#ece2cf] to-[#e2d6bd] md:flex md:items-center md:justify-center md:py-6">
      {/* 폰 프레임 */}
      <div className="relative mx-auto flex h-dvh w-full max-w-[430px] flex-col overflow-hidden bg-cream shadow-xl md:h-[880px] md:max-h-[92vh] md:rounded-[2.5rem] md:border-[6px] md:border-[#2c2a40]">
        {!ready ? (
          <div className="grid flex-1 place-items-center">
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
