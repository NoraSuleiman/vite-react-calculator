import { useEffect } from 'react'
import { useCalculator } from './useCalculator.js'
import './App.css'

const KEYS = [
  { label: 'AC', type: 'clear', span: 2 },
  { label: '⌫', type: 'backspace' },
  { label: '÷', type: 'operator', value: '/' },
  { label: '7', type: 'digit' },
  { label: '8', type: 'digit' },
  { label: '9', type: 'digit' },
  { label: '×', type: 'operator', value: '*' },
  { label: '4', type: 'digit' },
  { label: '5', type: 'digit' },
  { label: '6', type: 'digit' },
  { label: '−', type: 'operator', value: '-' },
  { label: '1', type: 'digit' },
  { label: '2', type: 'digit' },
  { label: '3', type: 'digit' },
  { label: '+', type: 'operator', value: '+' },
  { label: '0', type: 'digit', span: 2 },
  { label: '.', type: 'decimal' },
  { label: '=', type: 'equals' },
]

export default function App() {
  const calc = useCalculator()

  const handleKey = (key) => {
    switch (key.type) {
      case 'digit':
        return calc.inputDigit(key.label)
      case 'operator':
        return calc.chooseOperator(key.value)
      case 'decimal':
        return calc.inputDecimal()
      case 'equals':
        return calc.evaluate()
      case 'clear':
        return calc.clear()
      case 'backspace':
        return calc.backspace()
      default:
        return undefined
    }
  }

  useEffect(() => {
    const onKeyDown = (e) => {
      const { key } = e
      if (key >= '0' && key <= '9') calc.inputDigit(key)
      else if (key === '.') calc.inputDecimal()
      else if (['+', '-', '*', '/'].includes(key)) calc.chooseOperator(key)
      else if (key === 'Enter' || key === '=') {
        e.preventDefault()
        calc.evaluate()
      } else if (key === 'Backspace') calc.backspace()
      else if (key === 'Escape') calc.clear()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [calc])

  return (
    <main className="calculator">
      <h1 className="calculator-title">Calculator</h1>
      <div className="display" role="status" aria-live="polite">
        <div className="expression">{calc.expression}</div>
        <div className="current">{calc.display}</div>
      </div>
      <div className="keypad">
        {KEYS.map((key) => (
          <button
            key={key.label}
            className={`key key--${key.type}${key.span ? ' key--wide' : ''}`}
            onClick={() => handleKey(key)}
          >
            {key.label}
          </button>
        ))}
      </div>
    </main>
  )
}
