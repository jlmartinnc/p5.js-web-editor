/* eslint-disable */
import { includes } from 'lodash';
import p5CodeAstAnalyzer from '../components/p5CodeAstAnalyzer';
const parser = require('@babel/parser');
const traverse = require('@babel/traverse').default;

export function isGlobalReference(
  varName,
  context,
  scopeToDeclaredVarsMap,
  userDefinedClassMetadata,
  bc,
  isBaseThis
) {
  console.log(context, bc, varName);
  // First check: is this declared global at all?
  const globalVars = scopeToDeclaredVarsMap['global'] || {};
  if (!globalVars.hasOwnProperty(varName)) {
    return false; // not a global
  }

  // Next: check if shadowed in local scope (block, function, etc.)
  const localVars = scopeToDeclaredVarsMap[context] || {};
  if (localVars.hasOwnProperty(varName)) {
    return false; // locally declared → not global
  }

  // If inside a class context
  if (bc) {
    // const [className, methodName] = context.split('.');
    const className = context;
    let methodName = null;
    if (bc && bc.includes('.')) {
      methodName = bc.split('.').pop();
    }
    console.log('meow', className, methodName);
    const classMeta = userDefinedClassMetadata[className];
    if (classMeta) {
      // Shadowing inside constructor
      if (
        methodName === 'constructor' &&
        classMeta.constructor_params?.includes(varName)
      ) {
        return false;
      }

      // Shadowing inside method vars
      if (
        methodName &&
        classMeta.methodVars?.[methodName] &&
        classMeta.methodVars[methodName].hasOwnProperty(varName)
      ) {
        return false;
      }

      // Shadowing by instance fields declared in class (like "this.a = ...")
      if (classMeta.fields?.includes(varName) && isBaseThis) {
        return false;
      }
    }
  }

  // If we got here, it's not shadowed → must be a reference to the global
  return true;
}

export function isThisReference(cm, ast, fromPos, oldName) {
  const offset = cm.indexFromPos(fromPos);
  let isThisRef = false;

  traverse(ast, {
    MemberExpression(path) {
      const { node } = path;
      if (!node.loc) return;

      // check if cursor is inside this property name
      if (offset >= node.start && offset <= node.end) {
        if (
          node.object.type === 'ThisExpression' &&
          node.property.type === 'Identifier' &&
          node.property.name === oldName &&
          !node.computed // skip this["foo"]
        ) {
          isThisRef = true;
          path.stop(); // found it, stop traversal
        }
      }
    }
  });

  return isThisRef;
}

export function getContext(
  cm,
  ast,
  fromPos,
  scopeToDeclaredVarsMap,
  userDefinedClassMetadata
) {
  const offset = cm.indexFromPos(fromPos);
  let context = 'global';

  traverse(ast, {
    enter(path) {
      const { node } = path;
      if (!node.loc) return;
      if (offset < node.start || offset > node.end) return;

      if (
        (node.type === 'FunctionDeclaration' ||
          node.type === 'FunctionExpression' ||
          node.type === 'ArrowFunctionExpression') &&
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

      if (
        (node.type === 'ClassDeclaration' || node.type === 'ClassExpression') &&
        offset >= node.start &&
        offset <= node.end
      ) {
        context = node.id?.name || '(anonymous class)';
        path.skip();
      }
    }
  });

  return context;
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

export function getClassContext(cm, ast, fromPos) {
  const offset = cm.indexFromPos(fromPos);
  let classContext = null;

  traverse(ast, {
    enter(path) {
      const { node } = path;
      if (!node.loc) return;
      if (offset < node.start || offset > node.end) return;

      // Check if we're inside a class
      if (
        (node.type === 'ClassDeclaration' || node.type === 'ClassExpression') &&
        offset >= node.start &&
        offset <= node.end
      ) {
        const className = node.id?.name || '(anonymous class)';
        classContext = className;

        // Look for the method containing the offset
        const methodPath = path.get('body.body').find((p) => {
          return (
            (p.node.type === 'ClassMethod' ||
              p.node.type === 'ClassPrivateMethod') &&
            offset >= p.node.start &&
            offset <= p.node.end
          );
        });

        if (methodPath) {
          let methodName;
          if (methodPath.node.kind === 'constructor') {
            methodName = 'constructor';
          } else if (methodPath.node.key.type === 'Identifier') {
            methodName = methodPath.node.key.name;
          } else if (methodPath.node.key.type === 'StringLiteral') {
            methodName = methodPath.node.key.value;
          } else {
            methodName = '(anonymous method)';
          }

          classContext = `${className}.${methodName}`;
        }

        path.skip();
      }
    }
  });

  return classContext; // null if not inside a class
}
