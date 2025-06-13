import * as acorn from 'acorn';
import * as walk from 'acorn-walk';
import classMap from './class-with-methods-map.json';

const functionToClass = {};

Object.entries(classMap).forEach(([className, classData]) => {
  const createMethods = classData.createMethods || [];
  createMethods.forEach((fnName) => {
    functionToClass[fnName] = className;
  });
});

export default function parseCodeVariables(_cm) {
  const code = _cm.getValue();
  let ast;

  try {
    ast = acorn.parse(code, {
      ecmaVersion: 'latest',
      sourceType: 'script'
    });
  } catch (e) {
    console.warn('Failed to parse code', e.message);
    return {};
  }

  const variableMap = {};

  walk.simple(ast, {
    AssignmentExpression(node) {
      if (
        node.left.type === 'Identifier' &&
        node.right.type === 'CallExpression' &&
        node.right.callee.type === 'Identifier'
      ) {
        const varName = node.left.name;
        const fnName = node.right.callee.name;
        const cls = functionToClass[fnName];
        if (cls) {
          variableMap[varName] = cls;
        }
      }
    },

    VariableDeclarator(node) {
      if (
        node.id.type === 'Identifier' &&
        node.init?.type === 'CallExpression' &&
        node.init.callee.type === 'Identifier'
      ) {
        const varName = node.id.name;
        const fnName = node.init.callee.name;
        const cls = functionToClass[fnName];
        if (cls) {
          variableMap[varName] = cls;
        }
      }
    }
  });
  console.log('varmap= ', variableMap);

  return variableMap;
}
