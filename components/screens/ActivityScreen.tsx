"use client";

// 활동: 선택 동물에게 할 수 있는 행동을 카드로 제공
import { useState } from "react";
import { useGame } from "@/context/GameContext";
import BottomSheet from "../BottomSheet";
import FoodSelector from "../FoodSelector";
import PetSelector from "../PetSelector";
import ActivityCard from "../ActivityCard";
import SleepMode from "../SleepMode";
import SnackSelector from "../SnackSelector";
import WalkingTimer from "../WalkingTimer";

export default function ActivityScreen() {
  const {
    state,
    pets,
    selectedPet,
    selectPet,
    strokePet,
    feed,
    giveSnack,
    startSleep,
    wake,
    completeActivity,
    wash,
    takePhoto,
  } = useGame();

  const [sheet, setSheet] = useState<"food" | "snack" | null>(null);
  const [activityOpen, setActivityOpen] = useState(false);
  const [sleepOpen, setSleepOpen] = useState(false);

  const sleeping = selectedPet.isSleeping;
  const isDog = selectedPet.species === "dog";
  const walkType = isDog ? "walk" : "play";

  const handleSleep = () => {
    if (sleeping) {
      wake(selectedPet.id);
      setSleepOpen(false);
    } else {
      const r = startSleep(selectedPet.id);
      if (r.ok) setSleepOpen(true);
    }
  };

  const cards = [
    {
      emoji: "🤲",
      title: "쓰다듬기",
      description: `${selectedPet.name}를 부드럽게 쓰다듬어요.`,
      effect: "행복도 +3 / 친밀도 +2",
      onRun: () => strokePet(selectedPet.id),
      disabled: sleeping,
    },
    {
      emoji: "🍚",
      title: "밥 주기",
      description: "든든하게 밥을 챙겨줘요.",
      effect: "포만감 +30 / 체력 +5",
      onRun: () => setSheet("food"),
      disabled: sleeping,
    },
    {
      emoji: "🍪",
      title: "간식 주기",
      description: "좋아하는 간식을 골라줘요.",
      effect: "행복도 +9 / 친밀도 +4 / 포만감 +10",
      onRun: () => setSheet("snack"),
      disabled: sleeping,
    },
    {
      emoji: sleeping ? "☀️" : "🌙",
      title: sleeping ? "깨우기" : "재우기",
      description: sleeping
        ? "푹 쉰 동물을 깨워요."
        : "포근하게 재워 체력을 회복해요.",
      effect: "체력을 서서히 회복해요",
      actionLabel: sleeping ? "깨우기" : "재우기",
      onRun: handleSleep,
      disabled: false,
    },
    isDog
      ? {
          emoji: "🦮",
          title: "또또 산책",
          description: "또또와 함께 가볍게 걸어요.",
          effect: "행복도 +15 / 체력 -10 / 청결도 -5",
          onRun: () => setActivityOpen(true),
          disabled: sleeping,
        }
      : {
          emoji: "🧶",
          title: "쁘니와 놀기",
          description: "창가 구경하며 실내에서 놀아요.",
          effect: "행복도 +12 / 체력 -6 / 청결도 -1",
          onRun: () => setActivityOpen(true),
          disabled: sleeping,
        },
    {
      emoji: "🫧",
      title: "씻기",
      description: "보송보송하게 씻겨줘요.",
      effect: "청결도 +30 / 행복도 +3",
      onRun: () => wash(selectedPet.id),
      disabled: sleeping,
    },
    {
      emoji: "📸",
      title: "사진 찍기",
      description: "귀여운 순간을 남겨요.",
      effect: "행복도 +5",
      onRun: () => takePhoto(selectedPet.id),
      disabled: sleeping,
    },
  ];

  return (
    <div className="space-y-4">
      <header>
        <h1 className="font-display text-xl text-cocoa">활동</h1>
        <p className="text-xs text-cocoa-soft">
          동물을 선택하고 함께 할 활동을 골라주세요.
        </p>
      </header>

      <PetSelector pets={pets} selectedId={selectedPet.id} onSelect={selectPet} />

      {sleeping && (
        <p className="rounded-2xl bg-[#2c2a40] px-4 py-3 text-sm font-medium text-white">
          🌙 {selectedPet.name}가 자고 있어요. 먼저 깨우면 다른 활동을 할 수 있어요.
        </p>
      )}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {cards.map((c) => (
          <ActivityCard
            key={c.title}
            emoji={c.emoji}
            title={c.title}
            description={c.description}
            effect={c.effect}
            actionLabel={"actionLabel" in c ? c.actionLabel : "실행"}
            disabled={c.disabled}
            disabledNote="자는 중이에요"
            onRun={c.onRun}
          />
        ))}
      </div>

      <BottomSheet
        open={sheet === "food"}
        onClose={() => setSheet(null)}
        title={`${selectedPet.name} 밥 주기`}
        description="밥그릇을 선택해 주세요."
      >
        <FoodSelector
          pet={selectedPet}
          onPick={(id) => {
            const r = feed(selectedPet.id, id);
            if (r.ok) setSheet(null);
          }}
        />
      </BottomSheet>

      <BottomSheet
        open={sheet === "snack"}
        onClose={() => setSheet(null)}
        title={`${selectedPet.name} 간식 주기`}
        description="동물마다 좋아하는 간식이 달라요."
      >
        <SnackSelector
          pet={selectedPet}
          snackCount={state.inventory.snacks}
          onPick={(id) => {
            const r = giveSnack(selectedPet.id, id);
            if (r.ok) setSheet(null);
          }}
        />
      </BottomSheet>

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
