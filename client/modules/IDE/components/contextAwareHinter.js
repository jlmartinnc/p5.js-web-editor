import CodeMirror from 'codemirror';
import parseCode from './parseCode';
import parseCodeVars from './parseCodeVariables';
import classMap from './class-with-methods-map.json';

const scopeMap = require('./finalScopeMap.json');

function formatHintDisplay(name, isBlacklisted) {
  return `
    <div class="fun-item">
      <span class="fun-name">${name}</span>
      ${
        isBlacklisted
          ? `<div class="inline-warning">⚠️ "${name}" is discouraged in this context.</div>`
          : ''
      }
    </div>
  `;
}

function getExpressionBeforeCursor(cm) {
  const cursor = cm.getCursor();
  const line = cm.getLine(cursor.line);
  const uptoCursor = line.slice(0, cursor.ch);
  console.log('the line is: ', line);
  console.log('the line uptocursor is: ', uptoCursor);

  const match = uptoCursor.match(
    /([a-zA-Z_$][\w$]*(?:\.[a-zA-Z_$][\w$]*)*)\.(?:[a-zA-Z_$][\w$]*)?$/
  );
  return match ? match[1] : null;
}

export default function contextAwareHinter(cm, options = {}) {
  const variableTypes = parseCodeVars(cm);
  console.log('var types= ', variableTypes);

  const { hinter } = options;
  if (!hinter || typeof hinter.search !== 'function') {
    console.warn('Hinter is not available or invalid.');
    return [];
  }

  const baseExpression = getExpressionBeforeCursor(cm);
  const className = variableTypes[baseExpression]; // e.g., p5.XML
  console.log('base expression is= ', baseExpression);

  // If we're completing after a dot
  if (baseExpression && className) {
    console.log('Detected object expression:', baseExpression);

    console.log('Class of', baseExpression, '=', className);

    const methods = classMap[className]?.methods || [];
    console.log('Available methods for class:', methods);

    const cursor = cm.getCursor();
    const lineText = cm.getLine(cursor.line);
    const dotMatch = lineText
      .slice(0, cursor.ch)
      .match(/\.([a-zA-Z_$][\w$]*)?$/);

    let from = cursor;
    if (dotMatch) {
      const fullMatch = dotMatch[0];
      const methodStart = cursor.ch - fullMatch.length + 1; // +1 to skip the dot itself
      from = { line: cursor.line, ch: methodStart };
    } else {
      from = cursor;
    }

    console.log('fromm, dotmatch= ', from, dotMatch);

    const to = { line: cursor.line, ch: cursor.ch };
    let tokenLength = 0;
    if (dotMatch) {
      const typed = dotMatch[1] || ''; // what's typed after the dot
      tokenLength = typed.length;
    }

    const typed = dotMatch?.[1]?.toLowerCase() || '';

    const methodHints = methods
      .filter((method) => method.toLowerCase().startsWith(typed))
      .map((method) => ({
        item: {
          text: method,
          type: 'fun'
        },
        displayText: method,
        from,
        to
      }));

    return methodHints;
  }

  const { line, ch } = cm.getCursor();
  const { string } = cm.getTokenAt({ line, ch });
  const currentWord = string.trim();
  console.log('current word= ', currentWord);

  const context = parseCode(cm);
  const allHints = hinter.search(currentWord);

  const whitelist = scopeMap[context]?.whitelist || [];
  const blacklist = scopeMap[context]?.blacklist || [];

  const lowerCurrentWord = currentWord.toLowerCase();

  const filteredHints = allHints
    .filter(
      (h) =>
        h &&
        h.item &&
        typeof h.item.text === 'string' &&
        h.item.text.toLowerCase().startsWith(lowerCurrentWord)
    )
    .map((hint) => {
      const name = hint.item?.text || '';
      const isBlacklisted = blacklist.includes(name);

      return {
        ...hint,
        isBlacklisted,
        displayText: formatHintDisplay(name, isBlacklisted)
      };
    });

  const typePriority = {
    fun: 0,
    var: 1,
    keyword: 2,
    other: 3
  };

  const sorted = filteredHints.sort((a, b) => {
    const nameA = a.item?.text || '';
    const nameB = b.item?.text || '';
    const typeA = a.item?.type || 'other';
    const typeB = b.item?.type || 'other';

    const isBlacklistedA = a.isBlacklisted ? 1 : 0;
    const isBlacklistedB = b.isBlacklisted ? 1 : 0;

    const typeScoreA = typePriority[typeA] ?? typePriority.other;
    const typeScoreB = typePriority[typeB] ?? typePriority.other;

    if (isBlacklistedA !== isBlacklistedB) {
      return isBlacklistedA - isBlacklistedB;
    }

    if (typeScoreA !== typeScoreB) {
      return typeScoreA - typeScoreB;
    }

    return nameA.localeCompare(nameB);
  });

  return sorted;
}
