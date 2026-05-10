import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Vibration,
} from 'react-native';
import { evaluate, formatNumber } from './engine';

const COLORS = {
  bg: '#1a1a2e',
  surface: '#1e1e2e',
  display: '#13131f',
  num: '#2a2a3e',
  numText: '#e2e8f0',
  fn: '#252538',
  fnText: '#94a3b8',
  op: '#2d2d45',
  opText: '#a78bfa',
  eq: '#6366f1',
  eqText: '#ffffff',
  accent: '#6366f1',
  accentLight: '#a5b4fc',
  error: '#f87171',
  muted: 'rgba(255,255,255,0.35)',
  border: 'rgba(255,255,255,0.06)',
};

function CalcButton({ label, onPress, type = 'fn', wide = false }) {
  const bgColor = {
    num: COLORS.num,
    fn: COLORS.fn,
    op: COLORS.op,
    eq: COLORS.eq,
    clear: COLORS.op,
  }[type] || COLORS.fn;

  const textColor = {
    num: COLORS.numText,
    fn: COLORS.fnText,
    op: COLORS.opText,
    eq: COLORS.eqText,
    clear: '#f87171',
  }[type] || COLORS.fnText;

  return (
    <TouchableOpacity
      style={[
        styles.btn,
        { backgroundColor: bgColor },
        wide && styles.btnWide,
        type === 'eq' && styles.btnEq,
      ]}
      onPress={() => {
        Vibration.vibrate(20);
        onPress();
      }}
      activeOpacity={0.7}
    >
      <Text style={[styles.btnText, { color: textColor }, type === 'fn' && styles.btnTextFn]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

export default function Calculator() {
  const [expression, setExpression] = useState('');
  const [result, setResult] = useState('0');
  const [justCalc, setJustCalc] = useState(false);
  const [useDeg, setUseDeg] = useState(true);
  const [isError, setIsError] = useState(false);

  const tryEval = useCallback((expr, deg) => {
    try {
      const val = evaluate(expr, deg);
      if (isFinite(val) && !isNaN(val)) {
        setResult(formatNumber(val));
        setIsError(false);
      }
    } catch (_) {}
  }, []);

  const inputNum = (n) => {
    const newExpr = justCalc ? n : expression + n;
    setExpression(newExpr);
    setJustCalc(false);
    tryEval(newExpr, useDeg);
  };

  const inputFn = (fn) => {
    let newExpr = expression;
    if (justCalc) {
      const isOp = ['+', '-', '*', '/', '%', '^'].includes(fn);
      newExpr = isOp ? (isError ? '' : result) : '';
      setJustCalc(false);
    }
    if (fn === 'x²') newExpr += '**2';
    else if (fn === '1/') newExpr = '1/(' + newExpr + ')';
    else newExpr += fn;
    setExpression(newExpr);
    tryEval(newExpr, useDeg);
  };

  const inputDot = () => {
    if (justCalc) { setExpression('0.'); setResult('0.'); setJustCalc(false); return; }
    const segs = expression.split(/[+\-*/^(]/);
    if (!segs[segs.length - 1].includes('.')) {
      const newExpr = expression === '' ? '0.' : expression + '.';
      setExpression(newExpr);
    }
  };

  const clearAll = () => {
    setExpression('');
    setResult('0');
    setJustCalc(false);
    setIsError(false);
  };

  const deleteLast = () => {
    if (justCalc) { clearAll(); return; }
    const newExpr = expression.slice(0, -1);
    setExpression(newExpr);
    if (newExpr === '') { setResult('0'); return; }
    tryEval(newExpr, useDeg);
  };

  const toggleSign = () => {
    const newExpr = expression.startsWith('-') ? expression.slice(1) : '-' + expression;
    setExpression(newExpr);
    tryEval(newExpr, useDeg);
  };

  const calculate = () => {
    if (!expression) return;
    try {
      const val = evaluate(expression, useDeg);
      const formatted = formatNumber(val);
      setResult(formatted);
      setIsError(formatted === 'Erro');
      setExpression(formatted === 'Erro' ? '' : formatted);
    } catch (_) {
      setResult('Erro');
      setIsError(true);
      setExpression('');
    }
    setJustCalc(true);
  };

  const toggleDeg = () => {
    setUseDeg((d) => !d);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />
      <View style={styles.container}>

        {/* Display */}
        <View style={styles.display}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.exprScroll}>
            <Text style={styles.expression} numberOfLines={1}>
              {expression || ' '}
            </Text>
          </ScrollView>
          <Text
            style={[styles.result, isError && styles.resultError]}
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.4}
          >
            {result}
          </Text>
        </View>

        {/* Mode row */}
        <View style={styles.modeRow}>
          <TouchableOpacity
            style={[styles.modeBtn, !useDeg && styles.modeBtnActive]}
            onPress={toggleDeg}
          >
            <Text style={[styles.modeBtnText, !useDeg && styles.modeBtnTextActive]}>
              {useDeg ? 'DEG' : 'RAD'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Scientific row 1 */}
        <View style={styles.row}>
          <CalcButton label="sin"  onPress={() => inputFn('sin(')}  type="fn" />
          <CalcButton label="cos"  onPress={() => inputFn('cos(')}  type="fn" />
          <CalcButton label="tan"  onPress={() => inputFn('tan(')}  type="fn" />
          <CalcButton label="log"  onPress={() => inputFn('log(')}  type="fn" />
          <CalcButton label="ln"   onPress={() => inputFn('ln(')}   type="fn" />
        </View>

        {/* Scientific row 2 */}
        <View style={styles.row}>
          <CalcButton label="asin" onPress={() => inputFn('asin(')} type="fn" />
          <CalcButton label="acos" onPress={() => inputFn('acos(')} type="fn" />
          <CalcButton label="atan" onPress={() => inputFn('atan(')} type="fn" />
          <CalcButton label="√"    onPress={() => inputFn('sqrt(')} type="fn" />
          <CalcButton label="x²"   onPress={() => inputFn('x²')}    type="fn" />
        </View>

        {/* Scientific row 3 */}
        <View style={styles.row}>
          <CalcButton label="π"    onPress={() => inputFn('π')}     type="fn" />
          <CalcButton label="e"    onPress={() => inputFn('e')}      type="fn" />
          <CalcButton label="xʸ"   onPress={() => inputFn('^')}     type="fn" />
          <CalcButton label="n!"   onPress={() => inputFn('!')}      type="fn" />
          <CalcButton label="|x|"  onPress={() => inputFn('abs(')}  type="fn" />
        </View>

        {/* Operator row */}
        <View style={styles.row}>
          <CalcButton label="AC"   onPress={clearAll}                type="clear" />
          <CalcButton label="⌫"   onPress={deleteLast}              type="op" />
          <CalcButton label="%"    onPress={() => inputFn('%')}      type="op" />
          <CalcButton label="÷"    onPress={() => inputFn('/')}      type="op" />
          <CalcButton label="("    onPress={() => inputFn('(')}      type="op" />
        </View>

        {/* Num rows */}
        <View style={styles.row}>
          <CalcButton label="7"    onPress={() => inputNum('7')}     type="num" />
          <CalcButton label="8"    onPress={() => inputNum('8')}     type="num" />
          <CalcButton label="9"    onPress={() => inputNum('9')}     type="num" />
          <CalcButton label="×"    onPress={() => inputFn('*')}      type="op" />
          <CalcButton label=")"    onPress={() => inputFn(')')}      type="op" />
        </View>

        <View style={styles.row}>
          <CalcButton label="4"    onPress={() => inputNum('4')}     type="num" />
          <CalcButton label="5"    onPress={() => inputNum('5')}     type="num" />
          <CalcButton label="6"    onPress={() => inputNum('6')}     type="num" />
          <CalcButton label="−"    onPress={() => inputFn('-')}      type="op" />
          <CalcButton label="1/x"  onPress={() => inputFn('1/')}     type="fn" />
        </View>

        <View style={styles.row}>
          <CalcButton label="1"    onPress={() => inputNum('1')}     type="num" />
          <CalcButton label="2"    onPress={() => inputNum('2')}     type="num" />
          <CalcButton label="3"    onPress={() => inputNum('3')}     type="num" />
          <CalcButton label="+"    onPress={() => inputFn('+')}      type="op" />
          <CalcButton label="log₂" onPress={() => inputFn('log2(')} type="fn" />
        </View>

        <View style={styles.row}>
          <CalcButton label="0"    onPress={() => inputNum('0')}     type="num" />
          <CalcButton label="."    onPress={inputDot}                type="num" />
          <CalcButton label="±"    onPress={toggleSign}              type="op" />
          <CalcButton label="="    onPress={calculate}               type="eq"  wide />
        </View>

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  container: {
    flex: 1,
    padding: 12,
    gap: 8,
  },
  display: {
    backgroundColor: COLORS.display,
    borderRadius: 16,
    padding: 20,
    minHeight: 110,
    justifyContent: 'flex-end',
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 4,
  },
  exprScroll: {
    alignItems: 'flex-end',
    flexGrow: 1,
    justifyContent: 'flex-end',
  },
  expression: {
    fontSize: 14,
    color: COLORS.muted,
    textAlign: 'right',
    letterSpacing: 0.5,
  },
  result: {
    fontSize: 44,
    fontWeight: '300',
    color: '#ffffff',
    textAlign: 'right',
    letterSpacing: -1,
    marginTop: 4,
  },
  resultError: {
    color: COLORS.error,
    fontSize: 28,
  },
  modeRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 2,
  },
  modeBtn: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  modeBtnActive: {
    backgroundColor: 'rgba(99,102,241,0.2)',
    borderColor: COLORS.accent,
  },
  modeBtnText: {
    color: 'rgba(255,255,255,0.45)',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
  },
  modeBtnTextActive: {
    color: COLORS.accentLight,
  },
  row: {
    flexDirection: 'row',
    gap: 8,
  },
  btn: {
    flex: 1,
    height: 52,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnWide: {
    flex: 2,
  },
  btnEq: {
    shadowColor: COLORS.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  btnText: {
    fontSize: 18,
    fontWeight: '500',
  },
  btnTextFn: {
    fontSize: 13,
  },
});
