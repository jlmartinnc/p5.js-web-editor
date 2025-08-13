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

const jumpToLineChAfterLoad = (targetFileId, pos) => {
  let tries = 10;
  const tryJump = () => {
    const stateNow = store.getState();
    const filesNow = selectFiles(stateNow);
    const freshTarget = filesNow.find((f) => f.id === targetFileId); // get fresh copy
    const cm = freshTarget?.cmInstance;

    if (cm) {
      cm.setCursor(pos);
      cm.focus();
    } else if (tries-- > 0) {
      setTimeout(tryJump, 30);
    }
  };
  tryJump();
};

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

  if (!found) {
    const scriptOrder = getScriptLoadOrder(files);

    if (scriptOrder.length) {
      const projectSymbolTable =
        buildProjectSymbolTable(files, scriptOrder) || {};
      const globalSymbol = projectSymbolTable[varName];

      if (globalSymbol) {
        for (let i = scriptOrder.length - 1; i >= 0; i--) {
          const scriptName = scriptOrder[i];
          const file = files.find((f) => f.name.endsWith(scriptName));
          if (!file) continue;

          let ast;
          try {
            ast = parser.parse(file.content, {
              sourceType: 'script',
              plugins: ['jsx', 'typescript']
            });
          } catch {
            continue;
          }

          let foundInThisFile = false;
          traverse(ast, {
            FunctionDeclaration(path) {
              if (path.node.id?.name === varName) {
                const targetFileObj = file;

                const fileContent = targetFileObj.content;
                const beforeText = fileContent.slice(0, path.node.start);
                const line = beforeText.split('\n').length - 1;
                const ch = beforeText.split('\n').pop().length;

                store.dispatch(setSelectedFile(targetFileObj.id));
                pos = { line, ch };
                cm.setCursor(pos);

                announceToScreenReader(
                  `Jumped to definition of ${varName} in ${file.name}`
                );
                foundInThisFile = true;
                path.stop();
              }
            },
            VariableDeclarator(path) {
              if (path.node.id?.name === varName) {
                const targetFileObj = file;

                const fileContent = targetFileObj.content;
                const beforeText = fileContent.slice(0, path.node.start);
                const line = beforeText.split('\n').length - 1;
                const ch = beforeText.split('\n').pop().length;

                store.dispatch(setSelectedFile(targetFileObj.id));
                pos = { line, ch };
                cm.setCursor(pos);

                announceToScreenReader(
                  `Jumped to definition of ${varName} in ${file.name}`
                );
                foundInThisFile = true;
                path.stop();
              }
            }
          });

          if (foundInThisFile) break;
        }
      }
    }
  }

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
