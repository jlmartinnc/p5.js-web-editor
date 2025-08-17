/* eslint-disable */
import { includes } from 'lodash';
import p5CodeAstAnalyzer from './p5CodeAstAnalyzer';
import {
  getContext,
  getAST,
  isGlobalReference,
  getClassContext,
  isThisReference
} from '../utils/renameVariableHelper';
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
  if (!cm) {
    return;
  }
  const ast = getAST(cm);
  startRenaming(cm, ast, fromPos, newName, oldName);
}

function startRenaming(cm, ast, fromPos, newName, oldName) {
  const code = cm.getValue();
  const fromIndex = cm.indexFromPos(fromPos);
  const { scopeToDeclaredVarsMap = {}, userDefinedClassMetadata = {} } =
    p5CodeAstAnalyzer(cm) || {};

  const baseContext = getContext(
    cm,
    ast,
    fromPos,
    scopeToDeclaredVarsMap,
    userDefinedClassMetadata
  );
  const isInsideClassContext = baseContext in userDefinedClassMetadata;

  const bc = getClassContext(cm, ast, fromPos);

  const isBaseThis = isThisReference(cm, ast, fromPos, oldName);
  const isGlobal = isGlobalReference(
    oldName,
    baseContext,
    scopeToDeclaredVarsMap,
    userDefinedClassMetadata,
    bc,
    isBaseThis
  );

  console.log('Clicked identifier isThisReference? →', isBaseThis);
  console.log(fromPos, isGlobal, 'iscc=', isInsideClassContext);

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
        // If the node *is* one of the parameters being declared, allow renaming
        if (parent.params.includes(node)) {
          // parameter declaration → mark for renaming
        } else {
          // usage inside param list → skip
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

      if (isInsideClassContext) {
        // Case: inside a class
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

        // 1. Constructor parameter renaming
        console.log(baseMethodName, isThis, isBaseThis);
        if (
          baseMethodName === 'constructor' &&
          classMeta.constructor_params.includes(oldName) &&
          isThis === isBaseThis &&
          baseContext === thisContext
        ) {
          // Only rename inside the constructor body
          console.log(pos, 'constructor=', thisContext, baseContext);

          for (const [methodName, vars] of Object.entries(
            classMeta.methodVars || {}
          )) {
            // console.log(pos, !vars.includes(oldName), thisContext, methodName);
            if (!vars.includes(oldName) && thisContext === methodName) {
              shouldRenameMethodVar = true;
            }
          }
          shouldRename =
            thisContext === baseContext &&
            (currentMethodName == 'constructor' || shouldRenameGlobalVar);
        }
        // 2. Local variable inside a method (methodVars)
        else {
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
      } else {
        const thisScopeVars = scopeToDeclaredVarsMap[thisContext] || {};
        const baseScopeVars = scopeToDeclaredVarsMap[baseContext] || {};
        const globalScopeVars = scopeToDeclaredVarsMap['global'] || {};

        const isInBaseScope = thisContext === baseContext;
        const isShadowedLocally =
          !isInBaseScope && thisScopeVars.hasOwnProperty(oldName);
        const isDeclaredInBaseScope = baseScopeVars.hasOwnProperty(oldName);
        const isDeclaredGlobally = globalScopeVars.hasOwnProperty(oldName);

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

        // ✅ NEW: If we're in a class constructor and "oldName" is a parameter, skip
        if (
          thisContext in userDefinedClassMetadata &&
          currentMethodName === 'constructor' &&
          userDefinedClassMetadata[thisContext]?.constructor_params?.includes(
            oldName
          )
        ) {
          return; //don’t rename constructor param or its usages
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
