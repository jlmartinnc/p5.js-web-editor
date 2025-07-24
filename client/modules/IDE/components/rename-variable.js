/* eslint-disable */
import parseCodeVariables from './parseCodeVariables';
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
  const { varScopeMap = {} } = parseCodeVariables(cm) || {};

  if (!cm) {
    console.warn('CodeMirror instance not provided.');
    return;
  }
  const ast = getAST(cm);
  const context = getContext(cm, ast, fromPos, varScopeMap);
  startRenaming(cm, ast, fromPos, newName, oldName);
  const state = getRenameSearchState(cm, oldName);
  const matches = getMatches(cm, state, state.query);
}

export function getContext(cm, ast, fromPos, varScopeMap) {
  const posIndex = cm.indexFromPos(fromPos);
  let foundNode = null;
  let enclosingFunction = null;

  traverse(ast, {
    enter(path) {
      const { node } = path;
      if (!node.loc) return;

      const start = node.start;
      const end = node.end;

      // If position is inside this node
      if (start <= posIndex && posIndex <= end) {
        // Check if it's an identifier
        if (node.type === 'Identifier' && node.name) {
          // Assign only if not assigned yet or if it's more specific
          if (
            !foundNode ||
            (node.start >= foundNode.start && node.end <= foundNode.end)
          ) {
            foundNode = node;
          }
        }

        // Capture the enclosing function name
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
    console.warn('No identifier found at the selected position.');
    return null;
  }

  const varName = foundNode.name;

  // Now check varScopeMap to determine scope
  const contextCandidates = Object.entries(varScopeMap)
    .filter(([context, vars]) => vars.has(varName))
    .map(([context]) => context);

  // Priority logic
  if (contextCandidates.includes(enclosingFunction)) {
    return enclosingFunction; // local
  } else if (contextCandidates.includes('global')) {
    return 'global'; // global fallback
  } else {
    return enclosingFunction || 'global'; // fallback
  }
}

function startRenaming(cm, ast, fromPos, newName, oldName) {
  const code = cm.getValue();
  const fromIndex = cm.indexFromPos(fromPos);
  const varScopeMap = parseCodeVariables(cm).varScopeMap || {};
  const baseContext = getContext(cm, ast, fromPos, varScopeMap);

  const replacements = [];

  traverse(ast, {
    Identifier(path) {
      const { node, parent } = path;
      if (!node.loc) return;

      const startIndex = node.start;
      const endIndex = node.end;

      // Check it's the same variable name
      if (node.name !== oldName) return;

      const pos = cm.posFromIndex(startIndex);

      // Skip property keys and non-variable references
      if (
        parent.type === 'MemberExpression' &&
        parent.property === node &&
        !parent.computed
      )
        return;

      // Use the same getContext to figure out *this* node's context
      const thisContext = getContext(cm, ast, pos, varScopeMap);

      // Only allow rename if the context matches the original context
      if (thisContext === baseContext) {
        replacements.push({
          from: cm.posFromIndex(startIndex),
          to: cm.posFromIndex(endIndex)
        });
      }
    }
  });

  // Sort replacements in reverse order to avoid messing up the text positions
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
      plugins: ['jsx', 'typescript'] // add plugins as needed
    });
    return ast;
  } catch (e) {
    console.warn('Failed to parse code with Babel:', e.message);
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
  // Heuristic: if the query string is all lowercase, do a case insensitive search.
  return cm.getSearchCursor(
    query,
    pos,
    getRenameSearchState(cm).caseInsensitive
  );
}
