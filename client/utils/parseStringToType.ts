/* eslint-disable consistent-return */
/** Parses a string into a number or undefined if parsing fails. */
export function parseNumber(str: string): number | undefined {
  const num = Number(str);
  if (Number.isNaN(num)) {
    console.warn(`expected a number, got ${str}`);
    return undefined;
  }
  return num;
}

/** Parses a case-insensitive string into a boolean or undefined if parsing fails. */
export function parseBoolean(str: string): boolean | undefined {
  const lower = str.toLowerCase();
  if (lower === 'true') return true;
  if (lower === 'false') return false;

  console.warn(`expected a boolean, got ${str}`);
  return undefined;
}
