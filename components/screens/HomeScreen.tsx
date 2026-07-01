"use client";

// 홈(메인): 한 마리만 표시 + 돌봄 행동을 한 화면에서 수행
import { useCallback, useEffect, useRef, useState } from "react";
import { useGame } from "@/context/GameContext";
import { useTimeBasedStatus } from "@/hooks/useTimeBasedStatus";
import type { PetImageState } from "@/lib/constants";
import { pickSpeech } from "@/lib/mood";
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
  const { greeting, timeOfDay } = useTimeBasedStatus();

  const [sheet, setSheet] = useState<"food" | "snack" | null>(null);
  const [sleepOpen, setSleepOpen] = useState(false);
  const [speeches, setSpeeches] = useState<Record<PetId, string>>({
    toto: "",
    ppuni: "",
  });
  const [imageStates, setImageStates] = useState<
    Partial<Record<PetId, PetImageState>>
  >({});
  const flashTimers = useRef<Record<string, number>>({});

  useEffect(() => {
    const roll = () =>
      setSpeeches({
        toto: pickSpeech(state.pets.toto),
        ppuni: pickSpeech(state.pets.ppuni),
      });
    roll();
    const id = window.setInterval(roll, 18000);
    return () => window.clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
    if (r.ok) flashState(selectedPet.id, "happy");
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
    <div className="flex h-full flex-col gap-3 px-4 pt-5 pb-5">
      {/* 메인: 캐릭터 방 (컨트롤은 위에 오버레이) */}
      <div className="relative min-h-0 flex-1">
        <PetRoom
          pets={pets}
          selectedId={selectedPet.id}
          speech={speeches[selectedPet.id]}
          imageState={imageStates[selectedPet.id]}
          timeOfDay={timeOfDay}
          onStroke={strokePet}
        />

        {/* 상단 오버레이: 인사 · 간식 · 알림 */}
        <div className="pointer-events-none absolute inset-x-3 top-3 flex items-start justify-between gap-2">
          <div className="pointer-events-auto max-w-[52%] rounded-full bg-white/75 px-3 py-1.5 shadow-sm backdrop-blur">
            <p className="truncate font-display text-sm text-cocoa">
              {greeting}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="pointer-events-auto flex items-center gap-1 rounded-full bg-white/75 px-3 py-1.5 text-sm font-bold text-cocoa shadow-sm backdrop-blur">
              🍪 {state.inventory.snacks}
            </span>
            <button
              type="button"
              onClick={openNotifications}
              aria-label="알림 보기"
              className="no-tap-highlight pointer-events-auto grid h-9 w-9 place-items-center rounded-full bg-white/75 text-lg shadow-sm backdrop-blur transition active:scale-90"
            >
              🔔
            </button>
          </div>
        </div>

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
          <div className="w-60 max-w-[80%] rounded-full shadow-md">
            <PetSelector
              pets={pets}
              selectedId={selectedPet.id}
              onSelect={selectPet}
            />
          </div>
        </div>
      </div>

      {/* 상태 스트립 (슬림) */}
      <div className="shrink-0">
        <PetStatusPanel pet={selectedPet} />
      </div>

      {/* 돌봄 행동 (쓰다듬기는 캐릭터를 터치) */}
      <section
        className="shrink-0 rounded-3xl border border-cream-deep bg-card p-3 shadow-sm"
        aria-label="돌봄 행동"
      >
        <QuickActionMenu
          pet={selectedPet}
          onFeed={() => setSheet("food")}
          onSnack={() => setSheet("snack")}
          onWalk={handleWalk}
          onWash={handleWash}
          onSleepToggle={handleSleepToggle}
        />
      </section>

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
