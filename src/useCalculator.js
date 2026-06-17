import { useReducer } from 'react'

const initialState = {
  display: '0',      // the number currently shown / being typed
  previous: null,    // the stored left-hand operand (number)
  operator: null,    // pending operator: '+', '-', '*', '/'
  overwrite: false,  // next digit should replace the display
}

const OPERATOR_SYMBOLS = { '+': '+', '-': '−', '*': '×', '/': '÷' }

function compute(a, b, operator) {
  switch (operator) {
    case '+':
      return a + b
    case '-':
      return a - b
    case '*':
      return a * b
    case '/':
      return b === 0 ? null : a / b
    default:
      return b
  }
}

// Trim floating-point noise without dropping legitimate precision.
function format(value) {
  if (value === null) return 'Error'
  if (!Number.isFinite(value)) return 'Error'
  return parseFloat(value.toPrecision(12)).toString()
}

function reducer(state, action) {
  switch (action.type) {
    case 'digit': {
      if (state.display === 'Error') {
        return { ...initialState, display: action.digit }
      }
      if (state.overwrite) {
        return { ...state, display: action.digit, overwrite: false }
      }
      if (state.display === '0') {
        return { ...state, display: action.digit }
      }
      if (state.display.replace('-', '').length >= 15) return state
      return { ...state, display: state.display + action.digit }
    }

    case 'decimal': {
      if (state.display === 'Error') {
        return { ...initialState, display: '0.' }
      }
      if (state.overwrite) {
        return { ...state, display: '0.', overwrite: false }
      }
      if (state.display.includes('.')) return state
      return { ...state, display: state.display + '.' }
    }

    case 'operator': {
      if (state.display === 'Error') return state
      const current = parseFloat(state.display)

      // Chain operations: fold the pending one before storing the new operator.
      if (state.operator !== null && !state.overwrite && state.previous !== null) {
        const result = compute(state.previous, current, state.operator)
        return {
          display: format(result),
          previous: result,
          operator: action.operator,
          overwrite: true,
        }
      }

      return {
        ...state,
        previous: state.overwrite ? state.previous : current,
        operator: action.operator,
        overwrite: true,
      }
    }

    case 'equals': {
      if (state.operator === null || state.previous === null) return state
      const current = parseFloat(state.display)
      const result = compute(state.previous, current, state.operator)
      return {
        display: format(result),
        previous: null,
        operator: null,
        overwrite: true,
      }
    }

    case 'backspace': {
      if (state.overwrite || state.display === 'Error') return state
      if (state.display.length <= 1 || (state.display.length === 2 && state.display.startsWith('-'))) {
        return { ...state, display: '0' }
      }
      return { ...state, display: state.display.slice(0, -1) }
    }

    case 'clear':
      return initialState

    default:
      return state
  }
}

export function useCalculator() {
  const [state, dispatch] = useReducer(reducer, initialState)

  const expression =
    state.operator && state.previous !== null
      ? `${format(state.previous)} ${OPERATOR_SYMBOLS[state.operator]}`
      : ''

  return {
    display: state.display,
    expression,
    inputDigit: (digit) => dispatch({ type: 'digit', digit }),
    inputDecimal: () => dispatch({ type: 'decimal' }),
    chooseOperator: (operator) => dispatch({ type: 'operator', operator }),
    evaluate: () => dispatch({ type: 'equals' }),
    backspace: () => dispatch({ type: 'backspace' }),
    clear: () => dispatch({ type: 'clear' }),
  }
}
