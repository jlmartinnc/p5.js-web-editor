type EvalResult = {
  result: any,
  error: boolean
};

type EvalInClosureFn = (expr: string) => EvalResult;

function makeEvaluateExpression(evalInClosure: EvalInClosureFn) {
  return (expr: string) =>
    evalInClosure(`
    ${expr}`);
}

function evaluateExpression(): (expr: string) => EvalResult {
  return makeEvaluateExpression((expr: string): EvalResult => {
    let newExpr = expr;
    let result = null;
    let error = false;
    try {
      try {
        const wrapped = `(${expr})`;
        const validate = new Function(wrapped); // eslint-disable-line
        newExpr = wrapped; // eslint-disable-line
      } catch (e) {
        // We shouldn't wrap the expression
      }
      result = (0, eval)(newExpr); // eslint-disable-line
    } catch (e) {
      if (e instanceof Error) {
        result = `${e.name}: ${e.message}`;
      } else {
        result = String(e);
      }
      error = true;
    }
    return { result, error };
  });
}

export default evaluateExpression();
