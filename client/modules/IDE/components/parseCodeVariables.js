import * as acorn from 'acorn';
import * as walk from 'acorn-walk';
import * as eslintScope from 'eslint-scope';
import { debounce } from 'lodash';
import classMap from './class-with-methods-map.json';

const allFuncs = require('./listOfAllFunctions.json');

const allFunsList = new Set(allFuncs.functions.list);

const functionToClass = {};
Object.entries(classMap).forEach(([className, classData]) => {
  const createMethods = classData.createMethods || [];
  createMethods.forEach((fnName) => {
    functionToClass[fnName] = className;
  });
});

// Cache to store last valid result
let lastValidResult = {
  p5ClassMap: {},
  varMap: [],
  varScopeMap: {},
  userFuncMap: {},
  userClassMap: {}
};

function _parseCodeVariables(_cm) {
  const code = _cm.getValue();
  let ast;

  try {
    ast = acorn.parse(code, {
      ecmaVersion: 'latest',
      sourceType: 'script',
      locations: true,
      ranges: true
    });
  } catch (e) {
    console.warn('Failed to parse code - using cached result');
    return lastValidResult;
  }

  const p5ClassMap = {}; // stores p5 class to methods mapping
  const varMap = new Set();
  const varScopeMap = {};
  const userFuncMap = {};
  const userClassMap = {};

  const scopeManager = eslintScope.analyze(ast, {
    ecmaVersion: 2020,
    sourceType: 'script'
  });

  scopeManager.scopes.forEach((scope) => {
    const scopeName =
      scope.type === 'function'
        ? scope.block.id?.name || '<anonymous>'
        : scope.type;

    scope.variables.forEach((variable) => {
      variable.defs.forEach((def) => {
        varScopeMap[def.name.name] = scopeName;
      });
    });
  });

  walk.simple(ast, {
    ClassDeclaration(node) {
      if (node.id && node.id.type === 'Identifier') {
        const className = node.id.name;
        const classInfo = {
          const: new Set(), // use Set to avoid duplicates
          methods: []
        };

        node.body.body.forEach((element) => {
          if (element.type === 'MethodDefinition') {
            const methodName = element.key.name;

            if (element.kind === 'constructor') {
              element.value.body.body.forEach((stmt) => {
                if (
                  stmt.type === 'ExpressionStatement' &&
                  stmt.expression.type === 'AssignmentExpression'
                ) {
                  const expr = stmt.expression;
                  if (
                    expr.left.type === 'MemberExpression' &&
                    expr.left.object.type === 'ThisExpression' &&
                    expr.left.property.type === 'Identifier'
                  ) {
                    const propName = expr.left.property.name;
                    classInfo.const.add(propName);
                  }
                }
              });
            } else {
              classInfo.methods.push(methodName);
            }
          }
        });

        // Convert Set to Array before storing
        userClassMap[className] = {
          const: Array.from(classInfo.const),
          methods: classInfo.methods,
          initializer: ''
        };
      }
    }
  });

  walk.simple(ast, {
    AssignmentExpression(node) {
      if (
        node.left.type === 'Identifier' &&
        (node.right.type === 'CallExpression' ||
          node.right.type === 'NewExpression') &&
        node.right.callee.type === 'Identifier'
      ) {
        const varName = node.left.name;
        const fnName = node.right.callee.name;

        const cls = functionToClass[fnName];
        const userCls = userClassMap[fnName];
        if (userCls) {
          userClassMap[fnName].initializer = varName;
        } else if (cls) {
          p5ClassMap[varName] = cls;
        }
      }
    },

    VariableDeclarator(node) {
      if (
        node.id.type === 'Identifier' &&
        (node.init?.type === 'CallExpression' ||
          node.init?.type === 'NewExpression') &&
        node.init.callee.type === 'Identifier'
      ) {
        const varName = node.id.name;
        const fnName = node.init.callee.name;
        const cls = functionToClass[fnName];
        const userCls = userClassMap[fnName];
        if (userCls) {
          userClassMap[fnName].initializer = varName;
        } else if (cls) {
          p5ClassMap[varName] = cls;
        }
      }

      if (node.id.type === 'Identifier') {
        const varName = node.id.name;
        varMap.add(varName);
      }
    },

    FunctionDeclaration(node) {
      if (node.id && node.id.name) {
        const fnName = node.id.name;
        if (!allFunsList.has(fnName)) {
          userFuncMap[fnName] = true; // or even `= node` if you want more info later
          varMap.add(fnName); // Ensure functions are included in varMap too
        }
      }
    }
  });

  const result = {
    p5ClassMap,
    varMap: [...varMap],
    varScopeMap,
    userFuncMap,
    userClassMap
  };

  // Update cache
  lastValidResult = result;
  return result;
}

// Export a debounced version
export default debounce(_parseCodeVariables, 200, {
  leading: true,
  trailing: true,
  maxWait: 300
});
