import { useEffect, useState } from "react";

export type FitMode = "cover" | "contain";

const STORAGE_KEY = "sharePhotoBackgroundFit";

export function useSharePhotoBackgroundFit() {
  const [fitMode, setFitModeState] = useState<FitMode>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored === "contain" || stored === "cover" ? stored : "cover";
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, fitMode);
  }, [fitMode]);

  const setFitMode = (mode: FitMode) => {
    setFitModeState(mode);
  };

  return { fitMode, setFitMode };
}
