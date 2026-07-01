"use client";

// 홈(메인): 한 마리만 표시 + 돌봄 행동을 한 화면에서 수행
import { useCallback, useEffect, useRef, useState } from "react";
import { useGame } from "@/context/GameContext";
import type { PetImageState } from "@/lib/constants";
import { computeMood, moodToImageState, speechForState } from "@/lib/mood";
import type { PetId } from "@/lib/types";
import BottomSheet from "../BottomSheet";
import FoodSelector from "../FoodSelector";
import PetRoom from "../PetRoom";
import PetSelector from "../PetSelector";
import PetStatusPanel from "../PetStatusPanel";
import QuickActionMenu from "../QuickActionMenu";
import SleepMode from "../SleepMode";
import SnackSelector from "../SnackSelector";

// 산책/놀이 1회 기본 시간(내부값). 사용자에게 분 선택을 묻지 않는다.
const ACTIVITY_MINUTES = 3;

export default function HomeScreen() {
  const {
    state,
    pets,
    selectedPet,
    todayStats,
    selectPet,
    strokePet,
    feed,
    giveSnack,
    startSleep,
    wake,
    completeActivity,
    wash,
    pushToast,
  } = useGame();

  const [sheet, setSheet] = useState<"food" | "snack" | null>(null);
  const [sleepOpen, setSleepOpen] = useState(false);
  const [speechSeed, setSpeechSeed] = useState(0);
  const [imageStates, setImageStates] = useState<
    Partial<Record<PetId, PetImageState>>
  >({});
  const flashTimers = useRef<Record<string, number>>({});

  // 말풍선 문구를 가끔 바꿔주는 시드 (내용은 현재 표정과 일치)
  useEffect(() => {
    const id = window.setInterval(() => setSpeechSeed((s) => s + 1), 14000);
    return () => window.clearInterval(id);
  }, []);

  // 현재 표시되는 이미지 상태 = 플래시 우선, 없으면 무드 기반
  const displayState: PetImageState =
    imageStates[selectedPet.id] ?? moodToImageState(computeMood(selectedPet));
  const speech = speechForState(selectedPet, displayState, speechSeed);

  const flashState = useCallback(
    (petId: PetId, imgState: PetImageState, ms = 1600) => {
      setImageStates((prev) => ({ ...prev, [petId]: imgState }));
      window.clearTimeout(flashTimers.current[petId]);
      flashTimers.current[petId] = window.setTimeout(() => {
        setImageStates((prev) => ({ ...prev, [petId]: undefined }));
      }, ms);
    },
    []
  );

  const handleFeedPick = (foodId: string) => {
    const r = feed(selectedPet.id, foodId);
    if (r.ok) {
      flashState(selectedPet.id, "eating");
      setSheet(null);
    }
  };

  const handleSnackPick = (snackId: string) => {
    const r = giveSnack(selectedPet.id, snackId);
    if (r.ok) {
      flashState(selectedPet.id, "eating");
      setSheet(null);
    }
  };

  const handleSleepToggle = () => {
    if (selectedPet.isSleeping) {
      wake(selectedPet.id);
      setSleepOpen(false);
    } else {
      const r = startSleep(selectedPet.id);
      if (r.ok) setSleepOpen(true);
    }
  };

  const handleWash = () => {
    const r = wash(selectedPet.id);
    // 쁘니(고양이)는 목욕을 싫어해서 bad 표정, 또또는 happy 표정
    if (r.ok)
      flashState(
        selectedPet.id,
        selectedPet.species === "cat" ? "bad" : "happy",
        2200
      );
  };

  // 쓰다듬으면 잠깐 happy 표정으로 전환
  const handleStroke = (petId: PetId) => {
    strokePet(petId);
    flashState(petId, "happy", 1500);
  };

  // 산책/놀기: 누르면 바로 다녀온 것으로 처리하고 만족한 표정으로 전환
  const handleWalk = () => {
    if (selectedPet.isSleeping) return;
    const type = selectedPet.species === "dog" ? "walk" : "play";
    const r = completeActivity(selectedPet.id, type, ACTIVITY_MINUTES);
    flashState(selectedPet.id, "happy", 3000);
    const extra = r.foundSnack ? " 산책 중 간식도 발견했어요! 🍪" : "";
    pushToast(
      selectedPet.species === "dog"
        ? `${selectedPet.name}와 즐겁게 산책하고 왔어요!${extra}`
        : `${selectedPet.name}와 신나게 놀고 왔어요!${extra}`,
      "success",
      "🐾"
    );
  };

  const openNotifications = () => {
    pushToast(
      `오늘 밥 ${todayStats.meals}회 · 간식 ${todayStats.snacks}회 · ${state.streak.count}일 연속 돌봄 중!`,
      "info",
      "🔔"
    );
  };

  return (
    <div className="flex h-full flex-col">
      {/* 상단 HUD: 재화 · 알림 + 상태바(위로 이동, 글래스 카드) */}
      <div className="shrink-0 space-y-2 px-3 pt-2">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <span className="flex items-center gap-1 rounded-full border border-white/60 bg-white/85 px-3 py-1.5 text-sm font-extrabold text-cocoa shadow-sm backdrop-blur">
              🪙 {state.inventory.coins}
            </span>
            <span className="flex items-center gap-1 rounded-full border border-white/60 bg-white/85 px-3 py-1.5 text-sm font-extrabold text-cocoa shadow-sm backdrop-blur">
              🍪 {state.inventory.snacks}
            </span>
          </div>
          <button
            type="button"
            onClick={openNotifications}
            aria-label="알림 보기"
            className="no-tap-highlight grid h-9 w-9 place-items-center rounded-full border border-white/60 bg-white/85 text-lg shadow-sm backdrop-blur transition active:scale-90"
          >
            🔔
          </button>
        </div>
        <div className="rounded-3xl border border-white/60 bg-white/60 px-3 py-2.5 shadow-sm backdrop-blur-md">
          <PetStatusPanel pet={selectedPet} />
        </div>
      </div>

      {/* 캐릭터 스테이지 */}
      <div className="relative min-h-0 flex-1">
        <PetRoom
          pets={pets}
          selectedId={selectedPet.id}
          speech={speech}
          imageState={imageStates[selectedPet.id]}
          onStroke={handleStroke}
        />

        {/* 수면 배너 오버레이 */}
        {selectedPet.isSleeping && !sleepOpen && (
          <button
            type="button"
            onClick={() => setSleepOpen(true)}
            className="no-tap-highlight absolute inset-x-6 bottom-16 flex items-center justify-center gap-2 rounded-2xl bg-[#2c2a40]/95 px-4 py-2.5 text-sm font-bold text-white shadow-lg transition active:scale-95"
          >
            🌙 {selectedPet.name}가 자고 있어요 · 수면 화면 열기
          </button>
        )}

        {/* 하단 오버레이: 동물 전환 토글 (선택은 이 토글로만) */}
        <div className="absolute inset-x-0 bottom-3 flex justify-center">
          <div className="w-60 max-w-[80%] shadow-md">
            <PetSelector
              pets={pets}
              selectedId={selectedPet.id}
              onSelect={selectPet}
            />
          </div>
        </div>
      </div>

      {/* 하단: 플로팅 액션바 (글래스) */}
      <div className="shrink-0 px-3 pb-1">
        <div className="rounded-3xl border border-white/60 bg-white/80 px-2 py-2 shadow-[0_10px_28px_-10px_rgba(92,68,51,0.45)] backdrop-blur-md">
          <QuickActionMenu
            pet={selectedPet}
            onFeed={() => setSheet("food")}
            onSnack={() => setSheet("snack")}
            onWalk={handleWalk}
            onWash={handleWash}
            onSleepToggle={handleSleepToggle}
          />
        </div>
      </div>

      {/* 밥 시트 */}
      <BottomSheet
        open={sheet === "food"}
        onClose={() => setSheet(null)}
        title={`${selectedPet.name} 밥 주기`}
        description="밥그릇을 선택해 주세요."
      >
        <FoodSelector pet={selectedPet} onPick={handleFeedPick} />
      </BottomSheet>

      {/* 간식 시트 */}
      <BottomSheet
        open={sheet === "snack"}
        onClose={() => setSheet(null)}
        title={`${selectedPet.name} 간식 주기`}
        description="동물마다 좋아하는 간식이 달라요."
      >
        <SnackSelector
          pet={selectedPet}
          snackCount={state.inventory.snacks}
          onPick={handleSnackPick}
        />
      </BottomSheet>

      {/* 수면 오버레이 */}
      {sleepOpen && selectedPet.isSleeping && (
        <SleepMode
          pet={selectedPet}
          onWake={() => {
            wake(selectedPet.id);
            setSleepOpen(false);
          }}
        />
      )}
    </div>
  );
}
