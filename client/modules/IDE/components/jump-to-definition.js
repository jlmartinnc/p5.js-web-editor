/* eslint-disable */
import p5CodeAstAnalyzer from './p5CodeAstAnalyzer';
import * as parser from '@babel/parser';
import { getAST, getContext } from './rename-variable';
import { selectFiles } from '../selectors/files';
import { setSelectedFile } from '../actions/ide';
import announceToScreenReader from '../utils/ScreenReaderHelper';
import store from '../../../index';
const traverse = require('@babel/traverse').default;

function getScriptLoadOrder(files) {
  const indexHtmlFile = files.find((f) => f.name.endsWith('index.html'));
  if (!indexHtmlFile) return [];

  const scriptRegex = /<script\s+[^>]*src=["']([^"']+)["']/g;
  const scripts = [];
  let match;
  while ((match = scriptRegex.exec(indexHtmlFile.content)) !== null) {
    scripts.push(match[1]);
  }
  return scripts;
}

function buildProjectSymbolTable(files, scriptOrder) {
  const symbolTable = {};

  for (const scriptName of scriptOrder) {
    const file = files.find((f) => f.name.endsWith(scriptName));
    if (!file) continue;

    let ast;
    try {
      ast = parser.parse(file.content, {
        sourceType: 'script',
        plugins: ['jsx', 'typescript']
      });
    } catch (e) {
      continue;
    }

    traverse(ast, {
      FunctionDeclaration(path) {
        const name = path.node.id?.name;
        if (name && !symbolTable[name]) {
          symbolTable[name] = {
            file: file.name,
            pos: path.node.start
          };
        }
      },
      VariableDeclarator(path) {
        const name = path.node.id?.name;
        if (name && !symbolTable[name]) {
          symbolTable[name] = {
            file: file.name,
            pos: path.node.start
          };
        }
      }
    });
  }

  return symbolTable;
}

export function jumpToDefinition(pos) {
  const state = store.getState();
  const files = selectFiles(state);

  const cm = this._cm;
  const token = cm.getTokenAt(pos);
  const tokenType = token.type;

  if (!tokenType || tokenType === 'def') return;

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
    const scriptOrder = getScriptLoadOrder(files);

    const projectSymbolTable =
      buildProjectSymbolTable(files, scriptOrder) || {};
    const globalSymbol = projectSymbolTable[varName];

    if (globalSymbol) {
      const targetFileObj = files.find((f) => f.name === globalSymbol.file);
      if (!targetFileObj) {
        return;
      }

      store.dispatch(setSelectedFile(targetFileObj.id));

      if (!targetFileObj.cmInstance) {
        return;
      }

      const targetFileCM = targetFileObj.cmInstance;
      const defPos = targetFileCM.posFromIndex(globalSymbol.pos);
      targetFileCM.setCursor(defPos);
      targetFileCM.focus();

      announceToScreenReader(
        `Jumped to definition of ${varName} in ${globalSymbol.file}`
      );
      found = true;
    }
  }

  if (!found) {
    announceToScreenReader(`No definition found for ${varName}`, true);
  }
}
