import CodeMirror from 'codemirror';
import parseCode from './parseCode';
import parseCodeVariables from './parseCodeVariables';
import classMap from './class-with-methods-map.json';

const scopeMap = require('./finalScopeMap.json');

function formatHintDisplay(name, isBlacklisted) {
  return `
    <div class="fun-item">
      <span class="fun-name">${name}</span>
      ${
        isBlacklisted
          ? `<div class="inline-warning">⚠️ "Use ${name}" carefully in this context.</div>`
          : ''
      }
    </div>
  `;
}

function getExpressionBeforeCursor(cm) {
  const cursor = cm.getCursor();
  const line = cm.getLine(cursor.line);
  const uptoCursor = line.slice(0, cursor.ch);
  const match = uptoCursor.match(
    /([a-zA-Z_$][\w$]*(?:\.[a-zA-Z_$][\w$]*)*)\.(?:[a-zA-Z_$][\w$]*)?$/
  );
  return match ? match[1] : null;
}

export default function contextAwareHinter(cm, options = {}) {
  const {
    p5ClassMap = {},
    varScopeMap = {},
    userFuncMap = {},
    userClassMap = {}
  } = parseCodeVariables(cm) || {};

  const { hinter } = options;
  if (!hinter || typeof hinter.search !== 'function') {
    console.warn('Hinter is not available or invalid.');
    return [];
  }

  const baseExpression = getExpressionBeforeCursor(cm);

  // If we're completing after a dot
  if (baseExpression) {
    const className = p5ClassMap[baseExpression];
    const userClassEntry = Object.values(userClassMap).find(
      (cls) => cls.initializer === baseExpression
    );

    let methods = [];

    if (userClassEntry?.methods) {
      const { methods: userMethods } = userClassEntry;
      methods = userMethods;
    } else if (className && classMap[className]?.methods) {
      const { methods: classMethods } = classMap[className];
      methods = classMethods;
    } else {
      return [];
    }

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

  const currentContext = parseCode(cm);
  const allHints = hinter.search(currentWord);

  const whitelist = scopeMap[currentContext]?.whitelist || [];
  const blacklist = scopeMap[currentContext]?.blacklist || [];

  const lowerCurrentWord = currentWord.toLowerCase();

  function isInScope(varName) {
    return Object.entries(varScopeMap).some(
      ([scope, vars]) =>
        vars.has(varName) && (scope === 'global' || scope === currentContext)
    );
  }

  const allVarNames = Array.from(
    new Set(
      Object.values(varScopeMap)
        .map((s) => Array.from(s)) // convert Set to Array
        .flat()
        .filter((name) => typeof name === 'string')
    )
  );

  console.log(allVarNames);

  const varHints = allVarNames
    .filter(
      (varName) =>
        varName.toLowerCase().startsWith(lowerCurrentWord) && isInScope(varName)
    )
    .map((varName) => {
      const isFunc = !!userFuncMap[varName];
      const baseItem = isFunc
        ? { ...userFuncMap[varName] }
        : {
            text: varName,
            type: 'var',
            params: [],
            p5: false
          };

      return {
        item: baseItem,
        isBlacklisted: blacklist.includes(varName),
        displayText: formatHintDisplay(varName, blacklist.includes(varName)),
        from: { line, ch },
        to: { line: ch - currentWord.length }
      };
    });

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

  const combinedHints = [...varHints, ...filteredHints];

  const typePriority = {
    fun: 0,
    var: 1,
    keyword: 2,
    other: 3
  };

  const sorted = combinedHints.sort((a, b) => {
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
