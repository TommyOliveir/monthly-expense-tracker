"use client";

import useSound from "use-sound";

export function useCoinSound() {
  const [playCoin] = useSound("/sounds/coin.wav", {
    volume: 0.35,
  });

  return {
    playCoin,
  };
}