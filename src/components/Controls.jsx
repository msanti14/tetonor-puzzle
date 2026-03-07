// =============================================
// TETONOR - Controles auxiliares
// src/components/Controls.jsx
// =============================================

import React, { useState } from "react"

// ── Calculadora ───────────────────────────────────────────────────────────────
// Layout 4 columnas:
//  C   ⌫   ÷   ×
//  7   8   9   -
//  4   5   6   +
//  1   2   3   =
//  0 [span2]  .   =

function Calculator() {
  const [display, setDisplay] = useState("0")
  const [prev,    setPrev]    = useState(null)
  const [op,      setOp]      = useState(null)
  const [fresh,   setFresh]   = useState(true)

  function inputDigit(d) {
    if (fresh) { setDisplay(String(d)); setFresh(false) }
    else setDisplay(display === "0" ? String(d) : display + d)
  }

  function inputDot() {
    if (fresh) { setDisplay("0."); setFresh(false); return }
    if (!display.includes(".")) setDisplay(display + ".")
  }

  function calc(a, b, o) {
    if (o === "+") return parseFloat((a + b).toFixed(10))
    if (o === "-") return parseFloat((a - b).toFixed(10))
    if (o === "×") return parseFloat((a * b).toFixed(10))
    if (o === "÷") return b !== 0 ? parseFloat((a / b).toFixed(10)) : "Error"
    return b
  }

  function chooseOp(nextOp) {
    const cur = parseFloat(display)
    if (prev !== null && !fresh) {
      const res = calc(prev, cur, op)
      setDisplay(String(res)); setPrev(res)
    } else {
      setPrev(cur)
    }
    setOp(nextOp); setFresh(true)
  }

  function handleEquals() {
    if (op === null || prev === null) return
    const res = calc(prev, parseFloat(display), op)
    setDisplay(String(res)); setPrev(null); setOp(null); setFresh(true)
  }

  function handleClear() {
    setDisplay("0"); setPrev(null); setOp(null); setFresh(true)
  }

  function handleBackspace() {
    if (fresh || display.length === 1) { setDisplay("0"); setFresh(true) }
    else setDisplay(display.slice(0, -1))
  }

  const btns = [
    { label: "C",  fn: handleClear,        cls: "calc-btn--clear"  },
    { label: "⌫",  fn: handleBackspace,    cls: "calc-btn--op"     },
    { label: "÷",  fn: () => chooseOp("÷"),cls: "calc-btn--op"     },
    { label: "×",  fn: () => chooseOp("×"),cls: "calc-btn--op"     },
    { label: "7",  fn: () => inputDigit(7) },
    { label: "8",  fn: () => inputDigit(8) },
    { label: "9",  fn: () => inputDigit(9) },
    { label: "-",  fn: () => chooseOp("-"),cls: "calc-btn--op"     },
    { label: "4",  fn: () => inputDigit(4) },
    { label: "5",  fn: () => inputDigit(5) },
    { label: "6",  fn: () => inputDigit(6) },
    { label: "+",  fn: () => chooseOp("+"),cls: "calc-btn--op"     },
    { label: "1",  fn: () => inputDigit(1) },
    { label: "2",  fn: () => inputDigit(2) },
    { label: "3",  fn: () => inputDigit(3) },
    { label: "=",  fn: handleEquals,       cls: "calc-btn--equals" },
    { label: "0",  fn: () => inputDigit(0),span: 2                 },
    { label: ".",  fn: inputDot            },
    { label: "=",  fn: handleEquals,       cls: "calc-btn--equals" },
  ]

  return (
    <div className="calculator">
      <div className="calc-display">
        <span className="calc-op-indicator">{op ?? ""}</span>
        <span className="calc-value">{display}</span>
      </div>
      <div className="calc-grid">
        {btns.map((btn, i) => (
          <button
            key={i}
            className={`calc-btn ${btn.cls ?? ""} ${btn.span === 2 ? "calc-btn--span2" : ""}`}
            onClick={btn.fn}
          >
            {btn.label}
          </button>
        ))}
      </div>
    </div>
  )
}

// ── Componente principal ──────────────────────────────────────────────────────

// mobileMode: true  → solo botón reiniciar (footer mobile)
//             false → calculadora + anotador siempre visibles + reiniciar (panel desktop)

export default function Controls({ onReset, mobileMode = false }) {
  const [showConfirm, setShowConfirm] = useState(false)
  const [notes,       setNotes]       = useState("")

  const ResetButton = (
    <button className="ctrl-btn" onClick={() => setShowConfirm(true)} title="Reiniciar puzzle">
      🔄
    </button>
  )

  const ConfirmModal = showConfirm && (
    <div className="modal-overlay" onClick={() => setShowConfirm(false)}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <p className="modal-text">¿Reiniciar puzzle?</p>
        <p className="modal-subtext">Perderás tu progreso actual.</p>
        <div className="modal-buttons">
          <button className="btn btn--secondary" onClick={() => setShowConfirm(false)}>
            Cancelar
          </button>
          <button className="btn btn--verify" onClick={() => { setShowConfirm(false); onReset() }}>
            Reiniciar
          </button>
        </div>
      </div>
    </div>
  )

  if (mobileMode) {
    return (
      <>
        {ResetButton}
        {ConfirmModal}
      </>
    )
  }

  // Desktop: calculadora + anotador siempre visibles
  return (
    <div className="controls-panel">
      <div className="panel-section">
        <div className="panel-section__header">
          <span>Calculadora</span>
          {ResetButton}
        </div>
        <Calculator />
      </div>

      <div className="panel-section">
        <div className="panel-section__header">
          <span>Anotador</span>
        </div>
        <textarea
          className="notes-area notes-area--panel"
          value={notes}
          onChange={e => setNotes(e.target.value)}
          placeholder="Anotá tus cálculos acá..."
        />
      </div>

      {ConfirmModal}
    </div>
  )
}
