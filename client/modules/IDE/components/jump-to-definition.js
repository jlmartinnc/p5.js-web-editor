/* eslint-disable */
import p5CodeAstAnalyzer from './p5CodeAstAnalyzer';
import { getAST, getContext } from './rename-variable';
import announceToScreenReader from '../utils/ScreenReaderHelper';
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

  const currentContext = getContext(cm, ast, pos, scopeToDeclaredVarsMap);
  const isUserFunction = !!userDefinedFunctionMetadata[varName];
  const isDeclaredVar =
    scopeToDeclaredVarsMap[currentContext]?.[varName] !== undefined;

  let isAtDeclaration = false;

  traverse(ast, {
    VariableDeclarator(path) {
      if (
        path.node.id.name === varName &&
        path.node.start === cm.indexFromPos(pos)
      ) {
        isAtDeclaration = true;
        path.stop();
      }
    },
    FunctionDeclaration(path) {
      if (
        path.node.id?.name === varName &&
        path.node.start === cm.indexFromPos(pos)
      ) {
        isAtDeclaration = true;
        path.stop();
      }
    }
  });

  if (isAtDeclaration) {
    announceToScreenReader(`Already at definition of ${varName}`);
    return;
  }

  let found = false;

  traverse(ast, {
    VariableDeclarator(path) {
      if (found) return;

      const { node } = path;
      if (node.id.name === varName && node.loc) {
        const defPos = cm.posFromIndex(node.start);
        const defContext = getContext(cm, ast, defPos, scopeToDeclaredVarsMap);
        if (defContext === currentContext) {
          found = true;
          cm.setCursor(defPos);
          cm.focus();
          announceToScreenReader(
            `Jumped from line ${pos.line + 1} to line ${
              defPos.line + 1
            } at definition of ${varName}`
          );
        }
      }
    },

    FunctionDeclaration(path) {
      if (found) return;

      const { node } = path;

      if (node.id?.name === varName) {
        const defPos = cm.posFromIndex(node.start);
        const defContext = getContext(cm, ast, defPos, scopeToDeclaredVarsMap);
        if (defContext === currentContext) {
          found = true;
          cm.setCursor(defPos);
          cm.focus();
          announceToScreenReader(
            `Jumped from line ${pos.line + 1} to line ${
              defPos.line + 1
            } at definition of ${varName}`
          );
        }
      }

      if (!node.params || !node.loc) return;
      for (const param of node.params) {
        if (param.name === varName && param.loc) {
          const defPos = cm.posFromIndex(param.start);
          const defContext = getContext(
            cm,
            ast,
            defPos,
            scopeToDeclaredVarsMap
          );
          if (defContext === currentContext) {
            found = true;
            cm.setCursor(defPos);
            cm.focus();
            announceToScreenReader(
              `Jumped from line ${pos.line + 1} to line ${
                defPos.line + 1
              } at definition of ${varName}`
            );
          }
        }
      }
    }
  });

  if (!found) {
    traverse(ast, {
      VariableDeclarator(path) {
        if (found) return;

        const { node } = path;
        if (node.id.name === varName && node.loc) {
          const defPos = cm.posFromIndex(node.start);
          found = true;
          cm.setCursor(defPos);
          cm.focus();
          announceToScreenReader(
            `Jumped from line ${pos.line + 1} to line ${
              defPos.line + 1
            } at definition of ${varName}`
          );
        }
      },

      FunctionDeclaration(path) {
        if (found) return;

        const { node } = path;
        if (node.id?.name === varName) {
          const defPos = cm.posFromIndex(node.start);
          found = true;
          cm.setCursor(defPos);
          cm.focus();
          announceToScreenReader(
            `Jumped from line ${pos.line + 1} to line ${
              defPos.line + 1
            } at definition of ${varName}`
          );
        }
      }
    });
  }
  if (!found) {
    announceToScreenReader(`No definition found for ${varName}`, true);
  }
}
