"use client";

// 또또/쁘니 선택 세그먼트
import type { Pet, PetId } from "@/lib/types";

export default function PetSelector({
  pets,
  selectedId,
  onSelect,
}: {
  pets: Pet[];
  selectedId: PetId;
  onSelect: (id: PetId) => void;
}) {
  return (
    <div
      className="flex gap-1 rounded-full bg-cream-deep p-1"
      role="tablist"
      aria-label="동물 선택"
    >
      {pets.map((pet) => {
        const active = pet.id === selectedId;
        const activeColor = pet.id === "toto" ? "bg-toto" : "bg-ppuni";
        return (
          <button
            key={pet.id}
            role="tab"
            aria-selected={active}
            type="button"
            onClick={() => onSelect(pet.id)}
            className={`no-tap-highlight flex-1 rounded-full px-4 py-2 text-sm font-bold transition active:scale-95 ${
              active
                ? `${activeColor} text-white shadow-sm`
                : "text-cocoa-soft"
            }`}
          >
            {pet.name}
          </button>
        );
      })}
    </div>
  );
}
