/* eslint-disable */
import { includes } from 'lodash';
import p5CodeAstAnalyzer from './p5CodeAstAnalyzer';
import {
  getContext,
  getAST,
  isGlobalReference,
  getClassContext,
  isThisReference
} from './renameVariableHelper';
const parser = require('@babel/parser');
const traverse = require('@babel/traverse').default;

export function handleRename(fromPos, oldName, newName, cm) {
  if (!cm) {
    return;
  }
  const ast = getAST(cm);
  startRenaming(cm, ast, fromPos, newName, oldName);
}

function startRenaming(cm, ast, fromPos, newName, oldName) {
  const code = cm.getValue();
  const fromIndex = cm.indexFromPos(fromPos);
  const {
    scopeToDeclaredVarsMap = {},
    userDefinedClassMetadata = {},
    userDefinedFunctionMetadata = {}
  } = p5CodeAstAnalyzer(cm) || {};

  // Determine the context at the position where rename started
  const baseContext = getContext(
    cm,
    ast,
    fromPos,
    scopeToDeclaredVarsMap,
    userDefinedClassMetadata
  );

  const isInsideClassContext = baseContext in userDefinedClassMetadata;
  const baseClassContext = getClassContext(cm, ast, fromPos);
  const isBaseThis = isThisReference(cm, ast, fromPos, oldName);
  const isGlobal = isGlobalReference(
    oldName,
    baseContext,
    scopeToDeclaredVarsMap,
    userDefinedClassMetadata,
    baseClassContext,
    isBaseThis
  );

  const replacements = [];

  traverse(ast, {
    Identifier(path) {
      const { node, parent } = path;
      if (!node.loc || node.name !== oldName) return;

      const startIndex = node.start;
      const endIndex = node.end;

      if (node.name !== oldName) return;

      const pos = cm.posFromIndex(startIndex);

      if (
        (parent.type === 'FunctionDeclaration' ||
          parent.type === 'FunctionExpression' ||
          parent.type === 'ArrowFunctionExpression') &&
        parent.params.some((p) => p.type === 'Identifier' && p.name === oldName)
      ) {
        if (parent.params.includes(node)) {
        } else {
          return;
        }
      }

      if (
        parent.type === 'MemberExpression' &&
        parent.property === node &&
        !parent.computed
      ) {
        if (parent.object.type === 'ThisExpression' && !isBaseThis) {
          return;
        }
      }

      const thisContext = getContext(
        cm,
        ast,
        pos,
        scopeToDeclaredVarsMap,
        userDefinedClassMetadata
      );

      let shouldRename = false;
      let shouldRenameGlobalVar = false;
      const isThis = isThisReference(cm, ast, pos, oldName);

      // Handle renaming inside classes
      if (isInsideClassContext) {
        const classContext = getClassContext(cm, ast, fromPos);
        let baseMethodName = null;
        if (classContext && classContext.includes('.')) {
          baseMethodName = classContext.split('.').pop();
        }
        const classMeta = userDefinedClassMetadata[baseContext];

        const methodPath = path.findParent((p) => p.isClassMethod());
        let currentMethodName = null;

        if (methodPath) {
          if (methodPath.node.kind === 'constructor') {
            currentMethodName = 'constructor';
          } else if (methodPath.node.key.type === 'Identifier') {
            currentMethodName = methodPath.node.key.name;
          } else if (methodPath.node.key.type === 'StringLiteral') {
            currentMethodName = methodPath.node.key.value;
          }
        }

        if (
          baseMethodName === 'constructor' &&
          classMeta.constructor_params.includes(oldName) &&
          isThis === isBaseThis &&
          baseContext === thisContext
        ) {
          for (const [methodName, vars] of Object.entries(
            classMeta.methodVars || {}
          )) {
            if (!vars.includes(oldName) && thisContext === methodName) {
              shouldRenameMethodVar = true;
            }
          }
          shouldRename =
            thisContext === baseContext &&
            (currentMethodName == 'constructor' || shouldRenameGlobalVar);
        } else {
          for (const [methodName, vars] of Object.entries(
            classMeta.methodVars || {}
          )) {
            if (
              !vars.includes(oldName) &&
              baseMethodName === currentMethodName &&
              isThis === isBaseThis &&
              baseContext === thisContext
            ) {
              shouldRename = true;
            }
          }
        }

        // Rename constructor parameters, class fields, and method variables carefully
        if (
          classMeta.fields?.includes(oldName) &&
          isThis === isBaseThis &&
          baseContext === thisContext
        ) {
          shouldRename = true;
        }

        if (!(thisContext in userDefinedClassMetadata)) {
          const thisScopeVars = scopeToDeclaredVarsMap[thisContext] || {};
          shouldRename = isGlobal && !thisScopeVars.hasOwnProperty(oldName);
        }
        shouldRenameGlobalVar = isGlobal && thisContext === 'global';
      }
      // Handle renaming outside classes
      else {
        const thisScopeVars = scopeToDeclaredVarsMap[thisContext] || {};
        const baseScopeVars = scopeToDeclaredVarsMap[baseContext] || {};
        const globalScopeVars = scopeToDeclaredVarsMap['global'] || {};

        const isInBaseScope = thisContext === baseContext;
        const isShadowedLocally =
          !isInBaseScope && thisScopeVars.hasOwnProperty(oldName);
        const isDeclaredInBaseScope = baseScopeVars.hasOwnProperty(oldName);
        const isDeclaredGlobally = globalScopeVars.hasOwnProperty(oldName);
        const isThisGlobal = isGlobalReference(
          oldName,
          thisContext,
          scopeToDeclaredVarsMap,
          userDefinedClassMetadata,
          baseClassContext,
          isBaseThis
        );

        if (
          isThisGlobal &&
          thisContext in userDefinedFunctionMetadata &&
          userDefinedFunctionMetadata[thisContext].params.some(
            (param) => param.p === oldName
          )
        ) {
          return;
        }

        const methodPath = path.findParent((p) => p.isClassMethod());
        let currentMethodName = null;

        if (methodPath) {
          if (methodPath.node.kind === 'constructor') {
            currentMethodName = 'constructor';
          } else if (methodPath.node.key.type === 'Identifier') {
            currentMethodName = methodPath.node.key.name;
          } else if (methodPath.node.key.type === 'StringLiteral') {
            currentMethodName = methodPath.node.key.value;
          }
        }

        if (
          thisContext in userDefinedClassMetadata &&
          currentMethodName === 'constructor' &&
          userDefinedClassMetadata[thisContext]?.constructor_params?.includes(
            oldName
          )
        ) {
          return;
        }

        if (
          thisContext in userDefinedClassMetadata &&
          !(currentMethodName === 'constructor')
        ) {
          const classMeta = userDefinedClassMetadata[thisContext];
          for (const [methodName, vars] of Object.entries(
            classMeta.methodVars || {}
          )) {
            if (!vars.includes(oldName) && methodName === currentMethodName) {
              shouldRename = true;
            }
          }
        } else {
          shouldRename =
            isInBaseScope ||
            (!isShadowedLocally &&
              thisScopeVars.hasOwnProperty(oldName) === {} &&
              baseContext === 'global') ||
            (baseContext === 'global' &&
              !thisScopeVars.hasOwnProperty(oldName)) ||
            (isDeclaredGlobally &&
              !thisScopeVars.hasOwnProperty(oldName) &&
              !isDeclaredInBaseScope);

          shouldRenameGlobalVar =
            thisContext === 'global' && !isDeclaredInBaseScope;
        }
      }

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
