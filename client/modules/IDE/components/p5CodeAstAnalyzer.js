/* eslint-disable */
import { debounce } from 'lodash';
import * as eslintScope from 'eslint-scope';
import classMap from './p5-instance-methods-and-creators.json';

const parser = require('@babel/parser');
const traverse = require('@babel/traverse').default;

const allFuncs = require('./p5-reference-functions.json');
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
  variableToP5ClassMap: {},
  scopeToDeclaredVarsMap: {},
  userDefinedFunctionMetadata: {},
  userDefinedClassMetadata: {}
};

function _p5CodeAstAnalyzer(_cm) {
  const code = _cm.getValue();
  let ast;

  try {
    ast = parser.parse(code, {
      sourceType: 'script',
      plugins: ['jsx', 'classProperties'],
      ranges: true,
      locations: true
    });
  } catch (e) {
    return lastValidResult;
  }

  const variableToP5ClassMap = {};
  const scopeToDeclaredVarsMap = {};
  const userDefinedFunctionMetadata = {};
  const userDefinedClassMetadata = {};

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
        if (
          def.type === 'Variable' ||
          (def.type === 'FunctionName' && !allFunsList.has(def.name.name))
        ) {
          if (!scopeToDeclaredVarsMap[scopeName]) {
            scopeToDeclaredVarsMap[scopeName] = {};
          }
          const defType = def.type === 'FunctionName' ? 'fun' : 'var';
          scopeToDeclaredVarsMap[scopeName][def.name.name] = defType;
        }
      });
    });
  });

  traverse(ast, {
    ClassDeclaration(path) {
      const node = path.node;
      if (node.id && node.id.type === 'Identifier') {
        const className = node.id.name;
        const classInfo = {
          const: new Set(),
          methods: []
        };

        node.body.body.forEach((element) => {
          if (element.type === 'ClassMethod') {
            const methodName = element.key.name;

            if (element.kind === 'constructor') {
              element.body.body.forEach((stmt) => {
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

        userDefinedClassMetadata[className] = {
          const: Array.from(classInfo.const),
          methods: classInfo.methods,
          initializer: ''
        };
      }
    },

    AssignmentExpression(path) {
      const node = path.node;
      if (
        node.left.type === 'Identifier' &&
        (node.right.type === 'CallExpression' ||
          node.right.type === 'NewExpression') &&
        node.right.callee.type === 'Identifier'
      ) {
        const varName = node.left.name;
        const fnName = node.right.callee.name;

        const cls = functionToClass[fnName];
        const userCls = userDefinedClassMetadata[fnName];
        if (userCls) {
          userDefinedClassMetadata[fnName].initializer = varName;
        } else if (cls) {
          variableToP5ClassMap[varName] = cls;
        }
      }
    },

    VariableDeclarator(path) {
      const node = path.node;
      if (
        node.id.type === 'Identifier' &&
        (node.init?.type === 'CallExpression' ||
          node.init?.type === 'NewExpression') &&
        node.init.callee.type === 'Identifier'
      ) {
        const varName = node.id.name;
        const fnName = node.init.callee.name;
        const cls = functionToClass[fnName];
        const userCls = userDefinedClassMetadata[fnName];
        if (userCls) {
          userDefinedClassMetadata[fnName].initializer = varName;
        } else if (cls) {
          variableToP5ClassMap[varName] = cls;
        }
      }
    },

    FunctionDeclaration(path) {
      const node = path.node;
      if (node.id && node.id.name) {
        const fnName = node.id.name;
        if (!allFunsList.has(fnName)) {
          const params = node.params
            .map((param) => {
              if (param.type === 'Identifier') {
                return { p: param.name, o: false };
              } else if (
                param.type === 'AssignmentPattern' &&
                param.left.type === 'Identifier'
              ) {
                return { p: param.left.name, o: true };
              } else if (
                param.type === 'RestElement' &&
                param.argument.type === 'Identifier'
              ) {
                return { p: param.argument.name, o: true };
              }
              return null;
            })
            .filter(Boolean);

          // Store function metadata for hinting
          userDefinedFunctionMetadata[fnName] = {
            text: fnName,
            type: 'fun',
            p5: false,
            params
          };

          if (!scopeToDeclaredVarsMap[fnName]) {
            scopeToDeclaredVarsMap[fnName] = {};
          }
          params.forEach((paramObj) => {
            if (paramObj && paramObj.p) {
              scopeToDeclaredVarsMap[fnName][paramObj.p] = 'param';
            }
          });
        }
      }
    }
  });

  const result = {
    variableToP5ClassMap,
    scopeToDeclaredVarsMap,
    userDefinedFunctionMetadata,
    userDefinedClassMetadata
  };

  lastValidResult = result;
  return result;
}

// Export a debounced version
export default debounce(_p5CodeAstAnalyzer, 200, {
  leading: true,
  trailing: true,
  maxWait: 300
});
