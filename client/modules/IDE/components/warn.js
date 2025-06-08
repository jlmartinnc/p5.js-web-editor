import parseCode from './parseCode';

const scopeMap = require('./finalScopeMap.json');

/**
 * Checks if a completion is blacklisted in the current context and logs a warning if so.
 * @param {CodeMirror.Editor} cm - The CodeMirror instance
 * @param {string} text - The name of the selected function
 */
export default function warnIfBlacklisted(cm, text) {
  const context = parseCode(cm);
  const blacklist = scopeMap[context]?.blacklist || [];

  if (blacklist.includes(text)) {
    console.warn(
      `⚠️ Function "${text}" is usually not used in "${context}" context. Please be careful.`
    );
  }
}
