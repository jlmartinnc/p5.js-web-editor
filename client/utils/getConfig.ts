/**
 * Internal function to retrieve env vars, with no error handling.
 * @returns String value of env variable or undefined if not found.
 */
function getEnvVar(key: string): string | undefined {
  const env: Record<string, string | undefined> =
    (typeof global !== 'undefined' ? global : window)?.process?.env || {};

  return env[key];
}

type GetConfigOptions = {
  warn?: boolean;
  nullishString?: boolean;
};

/**
 * Returns a string config value from environment variables.
 * Logs a warning if the value is missing and `warn` is not explicitly disabled.
 *
 * @param key - The environment variable key to fetch.
 * @param options - Optional settings:
 *   - `warn`: whether to warn if the value is missing (default `true` unless in test env).
 *   - `nullishString`: if true, returns `''` instead of `undefined` when missing.
 * @returns String value of the env var, or `''` or `undefined` if missing.
 */
function getConfig(
  key: string,
  options: GetConfigOptions = {}
): string | undefined {
  if (!key) {
    throw new Error('"key" must be provided to getConfig()');
  }
  const isTestEnvironment = getEnvVar('NODE_ENV') === 'test';

  const { warn = !isTestEnvironment, nullishString = false } = options;

  const value = getEnvVar(key);

  if (value == null) {
    if (warn) {
      console.warn(`getConfig("${key}") returned null or undefined`);
    }
    return nullishString ? '' : undefined;
  }

  return value;
}

export default getConfig;
