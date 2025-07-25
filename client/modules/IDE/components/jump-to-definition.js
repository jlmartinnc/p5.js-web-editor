/* eslint-disable */
import p5CodeAstAnalyzer from './p5CodeAstAnalyzer';
import { getAST, getContext } from './rename-variable';
const traverse = require('@babel/traverse').default;

export function jumpToDefinition(pos) {
  const cm = this._cm;
  const token = cm.getTokenAt(pos);
  const tokenType = token.type;

  if (!tokenType || !tokenType.includes('variable')) return;

  const varName = token.string;

  const ast = getAST(cm);
  const scopeToDeclaredVarsMap =
    p5CodeAstAnalyzer(cm).scopeToDeclaredVarsMap || {};
  const context = getContext(cm, ast, pos, scopeToDeclaredVarsMap);

  if (
    !context ||
    !scopeToDeclaredVarsMap[context] ||
    !scopeToDeclaredVarsMap[context].has(varName)
  ) {
    return;
  }

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
        const defContext = getContext(cm, ast, defPos, scopeToDeclaredVarsMap);

        if (defContext === context) {
          found = true;
          cm.setCursor(defPos);
          cm.focus();
        }
      }
    },

    FunctionDeclaration(path) {
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
          const defContext = getContext(
            cm,
            ast,
            defPos,
            scopeToDeclaredVarsMap
          );

          if (defContext === context) {
            found = true;
            cm.setCursor(defPos);
            cm.focus();
          }
        }
      }
    }
  });
}
