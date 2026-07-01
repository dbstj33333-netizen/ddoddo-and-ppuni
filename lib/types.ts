// 앱 전반에서 사용하는 타입 정의

export type PetId = "toto" | "ppuni";
export type Species = "dog" | "cat";

export type StatKey =
  | "fullness"
  | "happiness"
  | "energy"
  | "cleanliness"
  | "affection";

export type Pet = {
  id: PetId;
  name: string;
  species: Species;
  fullness: number;
  happiness: number;
  energy: number;
  cleanliness: number;
  affection: number;
  affectionLevel: number;
  isSleeping: boolean;
  sleepStartedAt: string | null;
  lastUpdatedAt: string;
  totalPetCount: number;
  totalMealCount: number;
  totalSnackCount: number;
  totalActivityMinutes: number;
};

export type ActivityType =
  | "pet"
  | "meal"
  | "snack"
  | "sleep"
  | "walk"
  | "play"
  | "wash"
  | "photo";

export type StatChanges = Partial<{
  fullness: number;
  happiness: number;
  energy: number;
  cleanliness: number;
  affection: number;
}>;

export type ActivityLog = {
  id: string;
  petId: PetId;
  type: ActivityType;
  message: string;
  createdAt: string;
  durationMin?: number;
  changes: StatChanges;
};

export type Settings = {
  bgm: boolean;
  sfx: boolean;
  vibration: boolean;
  notifications: boolean;
};

export type Inventory = {
  snacks: number;
  coins: number;
};

export type Streak = {
  count: number;
  lastCheckIn: string | null; // YYYY-MM-DD
  claimedMilestones: number[]; // 지급 완료한 연속 보상 (3,7,14)
};

export type GameState = {
  version: number;
  pets: Record<PetId, Pet>;
  logs: ActivityLog[];
  inventory: Inventory;
  settings: Settings;
  streak: Streak;
  onboarded: boolean;
  selectedPetId: PetId;
};
