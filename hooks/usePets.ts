"use client";

// 동물 상태/선택 관련 뷰 훅 (상태 로직은 GameContext 에 위치)
import { useGame } from "@/context/GameContext";
import type { Pet, PetId } from "@/lib/types";

export function usePets(): {
  pets: Pet[];
  toto: Pet;
  ppuni: Pet;
  selectedPet: Pet;
  otherPet: Pet;
  selectPet: (id: PetId) => void;
} {
  const { state, selectedPet, otherPet, pets, selectPet } = useGame();
  return {
    pets,
    toto: state.pets.toto,
    ppuni: state.pets.ppuni,
    selectedPet,
    otherPet,
    selectPet,
  };
}
