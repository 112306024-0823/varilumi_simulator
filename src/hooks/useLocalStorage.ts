import { useState, useEffect } from "react";

/**
 * 本地儲存 Hook
 *
 * @param key localStorage 鍵名
 * @param initialValue 預設值
 * @returns [value, setValue] 狀態與設定函式
 *
 * @example
 * const [state, setState] = useLocalStorage("simulator", defaultState);
 */
export function useLocalStorage<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? (JSON.parse(item) as T) : initialValue;
    } catch {
      return initialValue;
    }
  });

  useEffect(() => {
    window.localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue] as const;
} 