// parseCode.js
// import * as acorn from 'acorn';
// import * as walk from 'acorn-walk';
const acorn = require('acorn');
const walk = require('acorn-walk');

export default function parseCode(_cm) {
  const code = _cm.getValue();
  const cursor = _cm.getCursor();
  const offset = _cm.indexFromPos(cursor);

  let ast;
  try {
    ast = acorn.parse(code, {
      ecmaVersion: 'latest',
      sourceType: 'script'
    });
  } catch (e) {
    console.warn('Failed to parse code', e.message);
    return 'global';
  }

  let context = 'global';

  walk.fullAncestor(ast, (node, ancestors) => {
    if (
      node.type === 'FunctionDeclaration' ||
      node.type === 'FunctionExpression' ||
      node.type === 'ArrowFunctionExpression'
    ) {
      if (offset >= node.start && offset <= node.end) {
        if (node.id && node.id.name) {
          context = node.id.name;
        } else {
          const parent = ancestors[ancestors.length - 2];
          if (
            parent?.type === 'VariableDeclarator' &&
            parent.id.type === 'Identifier'
          ) {
            context = parent.id.name;
          } else {
            context = '(anonymous)';
          }
        }
      }
    }
  });

  return context;
}
