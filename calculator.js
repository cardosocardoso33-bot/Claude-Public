'use strict';

let expression = '';
let useDegrees = true;
let inverseMode = false;
let justCalculated = false;

const resultEl = document.getElementById('result');
const expressionEl = document.getElementById('expression');

function toRad(x) {
  return useDegrees ? (x * Math.PI) / 180 : x;
}

function toDeg(x) {
  return useDegrees ? (x * 180) / Math.PI : x;
}

function factorial(n) {
  n = Math.round(n);
  if (n < 0) return NaN;
  if (n > 170) return Infinity;
  if (n === 0 || n === 1) return 1;
  let result = 1;
  for (let i = 2; i <= n; i++) result *= i;
  return result;
}

function evaluate(expr) {
  expr = expr.replace(/π/g, '(' + Math.PI + ')');
  expr = expr.replace(/\be\b/g, '(' + Math.E + ')');
  expr = expr.replace(/(\d+(?:\.\d+)?)\s*x²/g, '(($1)**2)');
  expr = expr.replace(/x²/g, '**2');
  expr = expr.replace(/1\/\(/g, '(1/(');
  expr = expr.replace(/\^/g, '**');
  expr = expr.replace(/(\d+(?:\.\d+)?)\s*%\s*(\d+(?:\.\d+)?)/g, '($1%$2)');
  expr = expr.replace(/(\d+(?:\.\d+)?)\s*%/g, '($1/100)');
  expr = expr.replace(/sin\(/g, '_sin(');
  expr = expr.replace(/cos\(/g, '_cos(');
  expr = expr.replace(/tan\(/g, '_tan(');
  expr = expr.replace(/asin\(/g, '_asin(');
  expr = expr.replace(/acos\(/g, '_acos(');
  expr = expr.replace(/atan\(/g, '_atan(');
  expr = expr.replace(/log2\(/g, '_log2(');
  expr = expr.replace(/log\(/g, '_log(');
  expr = expr.replace(/ln\(/g, '_ln(');
  expr = expr.replace(/sqrt\(/g, '_sqrt(');
  expr = expr.replace(/abs\(/g, '_abs(');
  expr = expr.replace(/(\d+(?:\.\d+)?)\s*!/g, '_fact($1)');

  const _sin  = (x) => Math.sin(toRad(x));
  const _cos  = (x) => Math.cos(toRad(x));
  const _tan  = (x) => Math.tan(toRad(x));
  const _asin = (x) => toDeg(Math.asin(x));
  const _acos = (x) => toDeg(Math.acos(x));
  const _atan = (x) => toDeg(Math.atan(x));
  const _log  = (x) => Math.log10(x);
  const _log2 = (x) => Math.log2(x);
  const _ln   = (x) => Math.log(x);
  const _sqrt = (x) => Math.sqrt(x);
  const _abs  = (x) => Math.abs(x);
  const _fact = (x) => factorial(x);

  return Function(
    '_sin', '_cos', '_tan', '_asin', '_acos', '_atan',
    '_log', '_log2', '_ln', '_sqrt', '_abs', '_fact',
    '"use strict"; return (' + expr + ');'
  )(_sin, _cos, _tan, _asin, _acos, _atan, _log, _log2, _ln, _sqrt, _abs, _fact);
}

function formatNumber(n) {
  if (typeof n !== 'number' || isNaN(n)) return 'Erro';
  if (!isFinite(n)) return n > 0 ? 'Infinito' : '-Infinito';
  const s = parseFloat(n.toPrecision(12)).toString();
  if (Math.abs(n) >= 1e15 || (Math.abs(n) < 1e-9 && n !== 0)) {
    return parseFloat(n.toPrecision(10)).toExponential();
  }
  return s;
}

function updateDisplay() {
  const val = resultEl.textContent;
  resultEl.classList.toggle('small', val.length > 12);
  resultEl.classList.toggle('error', val === 'Erro');
}

function inputNum(n) {
  if (justCalculated) { expression = ''; justCalculated = false; }
  expression += n;
  expressionEl.textContent = expression;
  try {
    const val = evaluate(expression);
    if (isFinite(val) && !isNaN(val)) {
      resultEl.textContent = formatNumber(val);
      resultEl.classList.remove('error');
    }
  } catch (_) {}
  updateDisplay();
}

function inputFn(fn) {
  if (justCalculated && !isOperator(fn)) {
    expression = resultEl.textContent === 'Erro' ? '' : resultEl.textContent.replace(/[^0-9.e+\-]/g, '');
    justCalculated = false;
  } else if (justCalculated && isOperator(fn)) {
    expression = resultEl.textContent;
    justCalculated = false;
  }
  if (fn === 'x²') expression += '**2';
  else if (fn === '1/') expression = '1/(' + expression + ')';
  else expression += fn;
  expressionEl.textContent = expression;
  try {
    const val = evaluate(expression);
    if (isFinite(val) && !isNaN(val)) {
      resultEl.textContent = formatNumber(val);
      resultEl.classList.remove('error');
    }
  } catch (_) {}
  updateDisplay();
}

function isOperator(fn) {
  return ['+', '-', '*', '/', '%', '^'].includes(fn);
}

function inputDot() {
  if (justCalculated) { expression = '0'; justCalculated = false; }
  const segments = expression.split(/[\+\-\*\/\(\^]/);
  const last = segments[segments.length - 1];
  if (!last.includes('.')) {
    expression += expression === '' ? '0.' : '.';
  }
  expressionEl.textContent = expression;
  updateDisplay();
}

function clearAll() {
  expression = '';
  justCalculated = false;
  expressionEl.textContent = '';
  resultEl.textContent = '0';
  resultEl.classList.remove('error', 'small');
}

function deleteLast() {
  if (justCalculated) { clearAll(); return; }
  expression = expression.slice(0, -1);
  expressionEl.textContent = expression;
  if (expression === '') { resultEl.textContent = '0'; return; }
  try {
    const val = evaluate(expression);
    if (isFinite(val) && !isNaN(val)) resultEl.textContent = formatNumber(val);
  } catch (_) {}
  updateDisplay();
}

function toggleSign() {
  if (expression === '' || expression === '0') return;
  expression = expression.startsWith('-') ? expression.slice(1) : '-' + expression;
  expressionEl.textContent = expression;
  try {
    const val = evaluate(expression);
    resultEl.textContent = formatNumber(val);
  } catch (_) {}
  updateDisplay();
}

function calculate() {
  if (expression === '') return;
  expressionEl.textContent = expression + ' =';
  try {
    const val = evaluate(expression);
    resultEl.textContent = formatNumber(val);
    resultEl.classList.remove('error');
    expression = formatNumber(val);
  } catch (_) {
    resultEl.textContent = 'Erro';
    resultEl.classList.add('error');
    expression = '';
  }
  justCalculated = true;
  updateDisplay();
}

function toggleDegRad() {
  useDegrees = !useDegrees;
  const btn = document.getElementById('deg-rad-btn');
  btn.textContent = useDegrees ? 'DEG' : 'RAD';
  btn.classList.toggle('active', !useDegrees);
}

function toggleInverse() {
  inverseMode = !inverseMode;
  const calc = document.querySelector('.calculator');
  calc.classList.toggle('inv-active', inverseMode);
  const invBtn = document.querySelector('.mode-btn:last-child');
  invBtn.classList.toggle('active', inverseMode);
}

document.addEventListener('keydown', (e) => {
  if (e.key >= '0' && e.key <= '9') { inputNum(e.key); return; }
  if (e.key === '.') { inputDot(); return; }
  if (e.key === '+' || e.key === '-') { inputFn(e.key); return; }
  if (e.key === '*') { inputFn('*'); return; }
  if (e.key === '/') { e.preventDefault(); inputFn('/'); return; }
  if (e.key === '%') { inputFn('%'); return; }
  if (e.key === '^') { inputFn('^'); return; }
  if (e.key === '(' || e.key === ')') { inputFn(e.key); return; }
  if (e.key === 'Enter' || e.key === '=') { calculate(); return; }
  if (e.key === 'Backspace') { deleteLast(); return; }
  if (e.key === 'Escape') { clearAll(); return; }
});
