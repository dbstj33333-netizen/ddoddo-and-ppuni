"use client";

// 홈(메인): 한 마리만 표시 + 모든 돌봄 행동을 한 화면에서 수행
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
import WalkingTimer from "../WalkingTimer";

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
    takePhoto,
    pushToast,
  } = useGame();
  const { greeting, timeOfDay } = useTimeBasedStatus();

  const [sheet, setSheet] = useState<"food" | "snack" | null>(null);
  const [activityOpen, setActivityOpen] = useState(false);
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

  const handlePhoto = () => {
    const r = takePhoto(selectedPet.id);
    if (r.ok) flashState(selectedPet.id, "happy");
  };

  const openNotifications = () => {
    pushToast(
      `오늘 밥 ${todayStats.meals}회 · 간식 ${todayStats.snacks}회 · ${state.streak.count}일 연속 돌봄 중!`,
      "info",
      "🔔"
    );
  };

  const walkType = selectedPet.species === "dog" ? "walk" : "play";

  return (
    <div className="flex h-full flex-col gap-2.5 px-4 pt-3 pb-3">
      {/* 상단 인사/간식/알림 */}
      <header className="flex shrink-0 items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="font-display text-lg leading-tight text-cocoa">
            {greeting}
          </p>
          <p className="truncate text-xs text-cocoa-soft">
            {selectedPet.name}와 함께하는 시간이에요.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1 rounded-full bg-butter/60 px-3 py-1.5 text-sm font-bold text-cocoa">
            🍪 {state.inventory.snacks}
          </span>
          <button
            type="button"
            onClick={openNotifications}
            aria-label="알림 보기"
            className="no-tap-highlight grid h-10 w-10 place-items-center rounded-full bg-cream-deep text-lg transition active:scale-90"
          >
            🔔
          </button>
        </div>
      </header>

      {/* 동물 전환 세그먼트 (선택은 이 토글로만) */}
      <div className="shrink-0">
        <PetSelector
          pets={pets}
          selectedId={selectedPet.id}
          onSelect={selectPet}
        />
      </div>

      {/* 반려동물 공간 (한 마리만, 남는 높이를 채움) */}
      <div className="min-h-0 flex-1">
        <PetRoom
          pets={pets}
          selectedId={selectedPet.id}
          speech={speeches[selectedPet.id]}
          imageState={imageStates[selectedPet.id]}
          timeOfDay={timeOfDay}
          onSelect={selectPet}
          onStroke={strokePet}
        />
      </div>

      {/* 수면 중 배너 */}
      {selectedPet.isSleeping && !sleepOpen && (
        <button
          type="button"
          onClick={() => setSleepOpen(true)}
          className="no-tap-highlight flex shrink-0 items-center justify-between rounded-2xl bg-[#2c2a40] px-4 py-2.5 text-sm font-bold text-white transition active:scale-95"
        >
          <span>🌙 {selectedPet.name}가 자고 있어요</span>
          <span className="text-xs text-[#b6b1d4]">수면 화면 열기 →</span>
        </button>
      )}

      {/* 모든 돌봄 행동 */}
      <section
        className="shrink-0 rounded-3xl border border-cream-deep bg-card p-3 shadow-sm"
        aria-label="돌봄 행동"
      >
        <QuickActionMenu
          pet={selectedPet}
          onPet={() => strokePet(selectedPet.id)}
          onFeed={() => setSheet("food")}
          onSnack={() => setSheet("snack")}
          onWalk={() => setActivityOpen(true)}
          onWash={handleWash}
          onPhoto={handlePhoto}
          onSleepToggle={handleSleepToggle}
        />
      </section>

      {/* 선택 동물 상태 */}
      <div className="shrink-0">
        <PetStatusPanel pet={selectedPet} />
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

      {/* 산책/놀이 오버레이 */}
      {activityOpen && (
        <WalkingTimer
          pet={selectedPet}
          type={walkType}
          onComplete={(minutes) =>
            completeActivity(selectedPet.id, walkType, minutes)
          }
          onClose={() => setActivityOpen(false)}
        />
      )}

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
