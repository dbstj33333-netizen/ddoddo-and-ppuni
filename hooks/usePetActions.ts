"use client";

// 돌봄 액션 모음 훅
import { useGame } from "@/context/GameContext";

export function usePetActions() {
  const {
    strokePet,
    feed,
    giveSnack,
    startSleep,
    wake,
    completeActivity,
    wash,
    takePhoto,
  } = useGame();
  return {
    strokePet,
    feed,
    giveSnack,
    startSleep,
    wake,
    completeActivity,
    wash,
    takePhoto,
  };
}
