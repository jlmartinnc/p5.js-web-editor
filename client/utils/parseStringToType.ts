import { isTestEnvironment } from './checkTestEnv';
/* eslint-disable consistent-return */
/**
 * Parses a string into a number.
 * - Returns `0` for nullish input if `nullishNumber` is true.
 * - Returns `undefined` otherwise for nullish or unrecognized input.
 */
export function parseNumber(
  str?: string,
  nullishNumber = false
): number | undefined {
  if (!str) {
    if (!isTestEnvironment) {
      console.warn(`parseNumber: got nullish input`);
    }
    return nullishNumber ? 0 : undefined;
  }

  const num = Number(str);
  if (Number.isNaN(num)) {
    console.warn(`parseNumber: expected a number, got ${str}`);
    return undefined;
  }

  return num;
}

/**
 * Parses a case-insensitive string into a boolean.
 * - Returns `false` for nullish input if `nullishBool` is true.
 * - Returns `undefined` otherwise for nullish or unrecognized input.
 */
export function parseBoolean(
  str?: string,
  nullishBool = false
): boolean | undefined {
  if (!str) {
    if (!isTestEnvironment) {
      console.warn('parseBoolean: got nullish input');
    }
    return nullishBool ? false : undefined;
  }

  const lower = str.toLowerCase();
  if (lower === 'true') return true;
  if (lower === 'false') return false;

  console.warn(`parseBoolean: expected 'true' or 'false', got "${str}"`);
  return undefined;
}
