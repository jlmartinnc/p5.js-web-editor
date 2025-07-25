import getContext from './getContext';

const scopeMap = require('./p5-scope-function-access-map.json');

/**
 * Checks if a completion is blacklisted in the current context and logs a warning if so.
 * @param {CodeMirror.Editor} cm - The CodeMirror instance
 * @param {string} text - The name of the selected function
 */
export default function warnIfBlacklisted(cm, text) {
  const context = getContext(cm);
  const blacklist = scopeMap[context]?.blacklist || [];

  const isBlacklisted = blacklist.includes(text);
  if (isBlacklisted) {
    console.warn(
      `⚠️ Function "${text}" is usually not used in "${context}" context. Please be careful.`
    );
  }
  return isBlacklisted;
}
