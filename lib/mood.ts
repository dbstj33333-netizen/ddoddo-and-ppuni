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
  // 심하게 낮은 상태가 없고 행복도가 충분히 높으면 = 기분 좋음 → happy.
  // 초기값(또또 75 / 쁘니 70)에서는 default 로 시작하도록 기준을 80 으로 둔다.
  if (lowestVal < 40) return lowestMood;
  if (happiness >= 80) return "happy";
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

// 시드 기반 선택 (렌더마다 흔들리지 않게 결정적으로 고름)
function seededPick(arr: readonly string[], seed: number): string {
  return arr[Math.abs(Math.trunc(seed)) % arr.length];
}

// 현재 표시되는 이미지 상태(표정)에 맞는 말풍선 → 문구와 이미지를 일치시킨다.
export function speechForState(
  pet: Pet,
  state: PetImageState,
  seed = 0
): string {
  const dog = pet.species === "dog";
  switch (state) {
    case "sleeping":
      return "쿨쿨… (기분 좋은 꿈을 꾸는 중)";
    case "eating":
      return seededPick(["냠냠, 맛있어!", "잘 먹을게!", "이거 좋아해!"], seed);
    case "bad":
      return dog
        ? seededPick(["으으, 부끄러워…", "살살 해줘~"], seed)
        : seededPick(
            ["목욕은 좀 싫은데…", "이건 참아줄게…", "칫, 어쩔 수 없네."],
            seed
          );
    case "happy":
      return dog
        ? seededPick(
            ["오늘 기분 최고야!", "헤헤, 너무 좋아!", "같이 있어서 행복해!"],
            seed
          )
        : seededPick(
            ["기분이 아주 좋아!", "골골골…", "오늘은 꽤 만족스러워."],
            seed
          );
    case "walking":
    case "playing":
      return seededPick(["신난다!", "재밌어!", "조금 더 놀자!"], seed);
    default:
      return moodSpeechSeeded(pet, seed);
  }
}

function moodSpeechSeeded(pet: Pet, seed: number): string {
  const mood = computeMood(pet);
  switch (mood) {
    case "hungry":
      return seededPick(["배에서 꼬르륵 소리가 나…", "밥 먹을 시간인가?"], seed);
    case "tired":
      return seededPick(["조금 졸린 것 같아.", "하암… 쉬고 싶어."], seed);
    case "dirty":
      return seededPick(["슬슬 씻고 싶어.", "몸이 근질근질해."], seed);
    case "bored":
      return seededPick(["조금 심심해.", "나랑 놀아줘!"], seed);
    case "happy":
      return pet.species === "dog" ? "오늘 기분 최고야!" : "기분이 아주 좋아!";
    default:
      return seededPick(RANDOM_SPEECH[pet.id], seed);
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
