/* eslint-disable */
import p5CodeAstAnalyzer from './p5CodeAstAnalyzer';
const parser = require('@babel/parser');
const traverse = require('@babel/traverse').default;

function SearchState(oldName) {
  this.posFrom = this.posTo = null;
  this.query = oldName;
  this.regexp = false;
  this.caseInsensitive = true;
  this.wholeWord = true;
}

export function handleRename(fromPos, oldName, newName, cm) {
  const { scopeToDeclaredVarsMap = {} } = p5CodeAstAnalyzer(cm) || {};

  if (!cm) {
    return;
  }
  const ast = getAST(cm);
  const context = getContext(cm, ast, fromPos, scopeToDeclaredVarsMap);
  startRenaming(cm, ast, fromPos, newName, oldName);
  const state = getRenameSearchState(cm, oldName);
  const matches = getMatches(cm, state, state.query);
}

export function getContext(cm, ast, fromPos, scopeToDeclaredVarsMap) {
  const posIndex = cm.indexFromPos(fromPos);
  let foundNode = null;
  let enclosingFunction = null;

  traverse(ast, {
    enter(path) {
      const { node } = path;
      if (!node.loc) return;

      const start = node.start;
      const end = node.end;

      if (start <= posIndex && posIndex <= end) {
        if (node.type === 'Identifier' && node.name) {
          if (
            !foundNode ||
            (node.start >= foundNode.start && node.end <= foundNode.end)
          ) {
            foundNode = node;
          }
        }

        if (
          (node.type === 'FunctionDeclaration' ||
            node.type === 'FunctionExpression') &&
          node.id &&
          node.id.name
        ) {
          enclosingFunction = node.id.name;
        }
      }
    }
  });

  if (!foundNode) {
    return null;
  }

  const varName = foundNode.name;

  const contextCandidates = Object.entries(scopeToDeclaredVarsMap)
    .filter(([context, vars]) => vars.has(varName))
    .map(([context]) => context);

  if (contextCandidates.includes(enclosingFunction)) {
    return enclosingFunction;
  } else if (contextCandidates.includes('global')) {
    return 'global';
  } else {
    return enclosingFunction || 'global';
  }
}

function startRenaming(cm, ast, fromPos, newName, oldName) {
  const code = cm.getValue();
  const fromIndex = cm.indexFromPos(fromPos);
  const scopeToDeclaredVarsMap =
    p5CodeAstAnalyzer(cm).scopeToDeclaredVarsMap || {};
  const baseContext = getContext(cm, ast, fromPos, scopeToDeclaredVarsMap);

  const replacements = [];

  traverse(ast, {
    Identifier(path) {
      const { node, parent } = path;
      if (!node.loc) return;

      const startIndex = node.start;
      const endIndex = node.end;

      if (node.name !== oldName) return;

      const pos = cm.posFromIndex(startIndex);

      if (
        parent.type === 'MemberExpression' &&
        parent.property === node &&
        !parent.computed
      )
        return;

      const thisContext = getContext(cm, ast, pos, scopeToDeclaredVarsMap);

      if (thisContext === baseContext) {
        replacements.push({
          from: cm.posFromIndex(startIndex),
          to: cm.posFromIndex(endIndex)
        });
      }
    }
  });

  replacements.sort(
    (a, b) => cm.indexFromPos(b.from) - cm.indexFromPos(a.from)
  );

  cm.operation(() => {
    for (const { from, to } of replacements) {
      cm.replaceRange(newName, from, to);
    }
  });
}

export function getAST(cm) {
  const code = cm.getValue();
  const cursor = cm.getCursor();
  const offset = cm.indexFromPos(cursor);

  let ast;
  try {
    ast = parser.parse(code, {
      sourceType: 'script',
      plugins: ['jsx', 'typescript']
    });
    return ast;
  } catch (e) {
    return;
  }
}

function getMatches(cm, state, query) {
  state.queryText = query;

  var cursor = getSearchCursor(cm, state.query);
  cursor.findNext();
  if (cm.showMatchesOnScrollbar) {
    if (state.annotate) {
      state.annotate.clear();
      state.annotate = null;
    }
    state.annotate = cm.showMatchesOnScrollbar(
      state.query,
      state.caseInsensitive
    );
  }
  var matches = cm.state.search.annotate.matches;
  return matches;
}

function getRenameSearchState(cm, oldName) {
  return cm.state.search || (cm.state.search = new SearchState(oldName));
}

function getSearchCursor(cm, query, pos) {
  return cm.getSearchCursor(
    query,
    pos,
    getRenameSearchState(cm).caseInsensitive
  );
}
