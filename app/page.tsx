import AppShell from "@/components/AppShell";
import { GameProvider } from "@/context/GameContext";

export default function Page() {
  return (
    <GameProvider>
      <AppShell />
    </GameProvider>
  );
}
