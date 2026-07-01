"use client";

// 범용 localStorage 상태 훅 (SSR 안전).
import { useCallback, useEffect, useRef, useState } from "react";

export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((prev: T) => T)) => void] {
  const [value, setValue] = useState<T>(initialValue);
  const loaded = useRef(false);

  // 마운트 시 1회 로드
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(key);
      if (raw != null) setValue(JSON.parse(raw) as T);
    } catch {
      /* 손상 시 초기값 유지 */
    }
    loaded.current = true;
  }, [key]);

  const set = useCallback(
    (next: T | ((prev: T) => T)) => {
      setValue((prev) => {
        const resolved =
          typeof next === "function" ? (next as (p: T) => T)(prev) : next;
        try {
          window.localStorage.setItem(key, JSON.stringify(resolved));
        } catch {
          /* 저장 실패 무시 */
        }
        return resolved;
      });
    },
    [key]
  );

  return [value, set];
}
