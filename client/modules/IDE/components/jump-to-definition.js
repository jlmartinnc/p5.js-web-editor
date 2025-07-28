/* eslint-disable */
import p5CodeAstAnalyzer from './p5CodeAstAnalyzer';
import { getAST, getContext } from './rename-variable';
const traverse = require('@babel/traverse').default;

export function jumpToDefinition(pos) {
  const cm = this._cm;
  const token = cm.getTokenAt(pos);
  const tokenType = token.type;

  if (!tokenType || !['variable', 'def'].some((t) => tokenType.includes(t)))
    return;

  const varName = token.string;

  const ast = getAST(cm);
  const { scopeToDeclaredVarsMap = {}, userDefinedFunctionMetadata = {} } =
    p5CodeAstAnalyzer(cm) || {};

  const context = getContext(cm, ast, pos, scopeToDeclaredVarsMap);

  // If not found in scope and not a user-defined function, abort
  const isUserFunction = !!userDefinedFunctionMetadata[varName];
  const isDeclaredVar =
    context &&
    scopeToDeclaredVarsMap[context] &&
    varName in scopeToDeclaredVarsMap[context];

  if (!isDeclaredVar && !isUserFunction) return;

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
      if (node.id?.type === 'Identifier' && node.id.name === varName) {
        const defPos = cm.posFromIndex(node.start);
        found = true;
        cm.setCursor(defPos);
        cm.focus();
      }

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
