/* eslint-disable */
import parseCodeVariables from './parseCodeVariables';
import { getAST, getContext } from './rename-variable';
const traverse = require('@babel/traverse').default;

export function jumpToDefinition(pos) {
  const cm = this._cm;
  const token = cm.getTokenAt(pos);
  const tokenType = token.type;

  // Only act if it's a variable
  if (!tokenType || !tokenType.includes('variable')) return;

  const varName = token.string;

  // Get full AST and variable scopes
  const ast = getAST(cm);
  const varScopeMap = parseCodeVariables(cm).varScopeMap || {};
  const context = getContext(cm, ast, pos, varScopeMap);

  if (!context || !varScopeMap[context] || !varScopeMap[context].has(varName)) {
    console.warn(`Variable "${varName}" not found in context "${context}".`);
    return;
  }

  // Now find the actual definition location using Babel traverse
  const targetIndex = cm.indexFromPos(pos);
  let found = false;

  traverse(ast, {
    VariableDeclarator(path) {
      if (found) return;

      const { node } = path;
      if (
        node.id.type === 'Identifier' &&
        node.id.name === varName &&
        node.loc
      ) {
        const defPos = cm.posFromIndex(node.start);
        const defContext = getContext(cm, ast, defPos, varScopeMap);

        if (defContext === context) {
          found = true;
          cm.setCursor(defPos);
          cm.focus();
        }
      }
    },

    FunctionDeclaration(path) {
      // Handle function parameters like: function foo(x) { x }
      if (found) return;

      const { node } = path;
      if (!node.params || !node.loc) return;

      for (const param of node.params) {
        if (
          param.type === 'Identifier' &&
          param.name === varName &&
          param.loc
        ) {
          const defPos = cm.posFromIndex(param.start);
          const defContext = getContext(cm, ast, defPos, varScopeMap);

          if (defContext === context) {
            found = true;
            cm.setCursor(defPos);
            cm.focus();
          }
        }
      }
    }
  });

  if (!found) {
    console.warn(
      `Definition for "${varName}" not found in context "${context}".`
    );
  }
}
