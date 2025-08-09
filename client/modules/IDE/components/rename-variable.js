/* eslint-disable */
import { includes } from 'lodash';
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
  startRenaming(cm, ast, fromPos, newName, oldName);
}

export function getContext(cm, ast, fromPos, scopeToDeclaredVarsMap) {
  const offset = cm.indexFromPos(fromPos);
  let context = 'global';

  traverse(ast, {
    enter(path) {
      const { node } = path;

      if (!node.loc) return;

      if (offset < node.start || offset > node.end) return;

      if (
        (node.type === 'FunctionDeclaration' ||
          node.type === 'FunctionExpression') &&
        node.body &&
        offset >= node.body.start &&
        offset <= node.body.end
      ) {
        if (node.id?.name) {
          context = node.id.name;
        } else {
          const parent = path.parentPath?.node;
          if (
            parent?.type === 'VariableDeclarator' &&
            parent.id?.type === 'Identifier'
          ) {
            context = parent.id.name;
          } else {
            context = '(anonymous)';
          }
        }

        path.skip();
      }
    }
  });

  return context;
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

      const thisScopeVars = scopeToDeclaredVarsMap[thisContext] || {};
      const baseScopeVars = scopeToDeclaredVarsMap[baseContext] || {};
      const globalScopeVars = scopeToDeclaredVarsMap['global'] || {};

      const isInBaseScope = thisContext === baseContext;
      const isShadowedLocally =
        !isInBaseScope && thisScopeVars.hasOwnProperty(oldName);
      const isDeclaredInBaseScope = baseScopeVars.hasOwnProperty(oldName);
      const isDeclaredGlobally = globalScopeVars.hasOwnProperty(oldName);

      const shouldRename =
        isInBaseScope ||
        (!isShadowedLocally &&
          thisScopeVars.hasOwnProperty(oldName) === {} &&
          baseContext === 'global') ||
        (baseContext === 'global' && !thisScopeVars.hasOwnProperty(oldName));

      const shouldRenameGlobalVar =
        thisContext === 'global' && !isDeclaredInBaseScope;

      if (shouldRename || shouldRenameGlobalVar) {
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
