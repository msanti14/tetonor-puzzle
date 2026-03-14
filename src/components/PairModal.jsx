// =============================================
// TETONOR - Modal de selección de par
// src/components/PairModal.jsx
// =============================================

import React, { useState, useMemo } from "react"

// activeIdx:    índice de la celda oculta que se edita
// currentValue: valor actual de esa celda (null si vacío)
// bottomNumbers: solución real (valores de celdas dadas)
// hiddenIndices: para saber cuáles son ocultas
// userAnswers:  respuestas actuales del jugador
// topGrid:      los 16 valores de la grilla
// onConfirm(value, idxA, idxB): confirma número + par
// onCancel():   cierra sin cambios

export default function PairModal({
  activeIdx,
  currentValue,
  bottomNumbers,
  hiddenIndices,
  userAnswers,
  topGrid,
  onConfirm,
  onCancel,
}) {
  const [inputValue, setInputValue] = useState(currentValue ?? "")
  const [selectedB,  setSelectedB]  = useState(null)
  const [error,      setError]      = useState("")

  // Candidatos para el par:
  // - celdas visibles (dadas)
  // - celdas ocultas ya confirmadas (tienen valor)
  // - excluir la propia celda activa
  const candidates = bottomNumbers
    .map((val, idx) => {
      if (idx === activeIdx) return null
      const isHidden = hiddenIndices.includes(idx)
      if (isHidden) {
        const ans = userAnswers[idx]
        if (ans == null) return null          // oculta sin confirmar: no disponible
        return { idx, value: ans, isHidden: true }
      }
      return { idx, value: val, isHidden: false }
    })
    .filter(Boolean)

  const topGridSet = useMemo(() => new Set(topGrid), [topGrid])

  const a = parseInt(inputValue, 10)
  const selectedCandidate = candidates.find(c => c.idx === selectedB)
  const b = selectedCandidate?.value

  // Preview en tiempo real
  let preview = null
  if (!isNaN(a) && a > 0 && b != null) {
    const sum         = a + b
    const product     = a * b
    const sumInGrid   = topGridSet.has(sum)
    const prodInGrid  = topGridSet.has(product)
    preview = { sum, product, sumInGrid, prodInGrid }
  }

  function handleConfirm() {
    if (!inputValue || isNaN(a) || a <= 0) {
      setError("Ingresá un número válido."); return
    }
    if (selectedB === null) {
      setError("Elegí un número de la fila para el par."); return
    }
    if (!selectedCandidate) {
      setError("Par inválido."); return
    }
    if (!topGridSet.has(a + b) || !topGridSet.has(a * b)) {
      setError(`${a} y ${b} no cubren suma Y producto en la grilla.`); return
    }
    setError("")
    onConfirm(a, activeIdx, selectedB)
  }

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="pair-modal" onClick={e => e.stopPropagation()}>

        <div className="pair-modal__header">
          <span>Completar celda</span>
          <button className="popup-close" onClick={onCancel}>✕</button>
        </div>

        {/* Paso 1: tu número */}
        <div className="pair-modal__section">
          <p className="pair-modal__label">① Tu número</p>
          <input
            className="pair-modal__input"
            type="number"
            min="1"
            value={inputValue}
            onChange={e => { setInputValue(e.target.value); setError("") }}
            autoFocus
            placeholder="?"
          />
        </div>

        {/* Paso 2: elegir par de la fila */}
        <div className="pair-modal__section">
          <p className="pair-modal__label">② Elegí el par de la fila</p>
          <div className="pair-modal__candidates">
            {candidates.length === 0
              ? <p className="pair-modal__hint">No hay números disponibles aún.</p>
              : candidates.map(c => (
                  <button
                    key={c.idx}
                    className={`pair-candidate${c.isHidden ? " pair-candidate--confirmed" : ""}${selectedB === c.idx ? " active" : ""}`}
                    onClick={() => { setSelectedB(c.idx); setError("") }}
                  >
                    {c.value}
                  </button>
                ))
            }
          </div>
        </div>

        {/* Preview */}
        {preview && (
          <div className="pair-modal__preview">
            <span className={`pair-preview-op ${preview.sumInGrid  ? "valid" : "invalid"}`}>
              {a} + {b} = {preview.sum}  {preview.sumInGrid  ? "✓" : "✗"}
            </span>
            <span className={`pair-preview-op ${preview.prodInGrid ? "valid" : "invalid"}`}>
              {a} × {b} = {preview.product}  {preview.prodInGrid ? "✓" : "✗"}
            </span>
          </div>
        )}

        {error && <p className="pair-modal__error">{error}</p>}

        <button className="btn btn--verify pair-modal__confirm" onClick={handleConfirm}>
          Confirmar
        </button>

      </div>
    </div>
  )
}
