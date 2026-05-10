'use strict';

export function toRad(x, deg) {
  return deg ? (x * Math.PI) / 180 : x;
}

export function toDeg(x, deg) {
  return deg ? (x * 180) / Math.PI : x;
}

export function factorial(n) {
  n = Math.round(n);
  if (n < 0) return NaN;
  if (n > 170) return Infinity;
  if (n <= 1) return 1;
  let r = 1;
  for (let i = 2; i <= n; i++) r *= i;
  return r;
}

export function evaluate(expr, useDegrees) {
  let e = expr;
  e = e.replace(/π/g, '(' + Math.PI + ')');
  e = e.replace(/\be\b/g, '(' + Math.E + ')');
  e = e.replace(/\^/g, '**');
  e = e.replace(/(\d+(?:\.\d+)?)\s*%\s*(\d+(?:\.\d+)?)/g, '($1%$2)');
  e = e.replace(/(\d+(?:\.\d+)?)\s*%/g, '($1/100)');
  e = e.replace(/sin\(/g, '_sin(');
  e = e.replace(/cos\(/g, '_cos(');
  e = e.replace(/tan\(/g, '_tan(');
  e = e.replace(/asin\(/g, '_asin(');
  e = e.replace(/acos\(/g, '_acos(');
  e = e.replace(/atan\(/g, '_atan(');
  e = e.replace(/log2\(/g, '_log2(');
  e = e.replace(/log\(/g, '_log(');
  e = e.replace(/ln\(/g, '_ln(');
  e = e.replace(/sqrt\(/g, '_sqrt(');
  e = e.replace(/abs\(/g, '_abs(');
  e = e.replace(/(\d+(?:\.\d+)?)\s*!/g, '_fact($1)');
  e = e.replace(/(\d+(?:\.\d+)?)\*\*2/g, '(($1)**2)');

  const _sin  = (x) => Math.sin(toRad(x, useDegrees));
  const _cos  = (x) => Math.cos(toRad(x, useDegrees));
  const _tan  = (x) => Math.tan(toRad(x, useDegrees));
  const _asin = (x) => toDeg(Math.asin(x), useDegrees);
  const _acos = (x) => toDeg(Math.acos(x), useDegrees);
  const _atan = (x) => toDeg(Math.atan(x), useDegrees);
  const _log  = (x) => Math.log10(x);
  const _log2 = (x) => Math.log2(x);
  const _ln   = (x) => Math.log(x);
  const _sqrt = (x) => Math.sqrt(x);
  const _abs  = (x) => Math.abs(x);
  const _fact = (x) => factorial(x);

  // eslint-disable-next-line no-new-func
  return Function(
    '_sin','_cos','_tan','_asin','_acos','_atan',
    '_log','_log2','_ln','_sqrt','_abs','_fact',
    '"use strict"; return (' + e + ');'
  )(_sin,_cos,_tan,_asin,_acos,_atan,_log,_log2,_ln,_sqrt,_abs,_fact);
}

export function formatNumber(n) {
  if (typeof n !== 'number' || isNaN(n)) return 'Erro';
  if (!isFinite(n)) return n > 0 ? '∞' : '-∞';
  if (Math.abs(n) >= 1e15 || (Math.abs(n) < 1e-9 && n !== 0)) {
    return parseFloat(n.toPrecision(10)).toExponential();
  }
  return parseFloat(n.toPrecision(12)).toString();
}
