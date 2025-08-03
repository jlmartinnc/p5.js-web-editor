import { useEffect, useRef } from 'react';

/**
 * Used in Menubar to store the previous value of a number.
 * @param value - The current value to track.
 * @returns The previous value before the current render, or undefined if none.
 */
export default function usePrevious(value: number): number | undefined {
  const ref = useRef<number>();

  useEffect(() => {
    ref.current = value;
  }, [value]);

  return ref.current;
}
