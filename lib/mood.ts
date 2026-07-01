// 상태값에 따른 캐릭터 표정(이미지 상태)과 말풍선 선택

import { RANDOM_SPEECH } from "./constants";
import type { PetImageState } from "./constants";
import type { Pet } from "./types";
import { randomItem } from "./utils";

export type Mood = "happy" | "neutral" | "hungry" | "tired" | "dirty" | "bored" | "sleeping";

export function computeMood(pet: Pet): Mood {
  if (pet.isSleeping) return "sleeping";
  const { fullness, happiness, energy, cleanliness } = pet;
  const entries: [Mood, number][] = [
    ["hungry", fullness],
    ["bored", happiness],
    ["tired", energy],
    ["dirty", cleanliness],
  ];
  entries.sort((a, b) => a[1] - b[1]);
  const [lowestMood, lowestVal] = entries[0];
  if (lowestVal < 40) return lowestMood;
  if (fullness >= 80 && happiness >= 80 && energy >= 80 && cleanliness >= 80)
    return "happy";
  return "neutral";
}

export function moodToImageState(mood: Mood): PetImageState {
  switch (mood) {
    case "sleeping":
      return "sleeping";
    case "happy":
      return "happy";
    default:
      return "default";
  }
}

// 기분에 맞는 말풍선 (같은 pet 이름 반영은 호출부에서 처리)
export function pickSpeech(pet: Pet): string {
  const mood = computeMood(pet);
  const name = pet.name;
  switch (mood) {
    case "sleeping":
      return "쿨쿨… (기분 좋은 꿈을 꾸는 중)";
    case "hungry":
      return randomItem([
        "배에서 꼬르륵 소리가 나는 것 같아요.",
        "밥 먹을 시간이 된 것 같아!",
      ]);
    case "bored":
      return randomItem([
        "조금 심심한 것 같아요.",
        "같이 놀아주면 기분이 좋아질 거예요.",
      ]);
    case "tired":
      return randomItem(["조금 쉬고 싶어 해요.", "하암… 졸린 것 같아."]);
    case "dirty":
      return "씻겨주면 더 상쾌해질 것 같아요.";
    case "happy":
      return pet.species === "dog"
        ? `오늘 ${name}의 기분은 최고예요!`
        : `${name}가 아주 만족스러워 보여요.`;
    default:
      return randomItem(RANDOM_SPEECH[pet.id]);
  }
}

// 이모지 폴백 (이미지 로드 실패 시)
export function fallbackEmoji(pet: Pet, mood: Mood): string {
  if (pet.species === "dog") {
    if (mood === "sleeping") return "😴";
    if (mood === "happy") return "🐶";
    if (mood === "bored" || mood === "tired") return "🐕";
    return "🐶";
  }
  // cat (치즈)
  if (mood === "sleeping") return "😴";
  if (mood === "happy") return "😸";
  if (mood === "bored" || mood === "tired") return "🐈";
  return "🐱";
}
