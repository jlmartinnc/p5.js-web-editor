import { useEffect, useRef } from 'react';

/**
 * Used in Menubar to store the previous value.
 * @param value - The current value to track.
 * @returns The previous value before the current render, or undefined if none.
 */
export function usePrevious(value: unknown): unknown | undefined {
  const ref = useRef<unknown>();

  useEffect(() => {
    ref.current = value;
  }, [value]);

  return ref.current;
}
