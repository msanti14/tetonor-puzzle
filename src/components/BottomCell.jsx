// =============================================
// TETONOR - Celda de la Fila Inferior
// src/components/BottomCell.jsx
// =============================================

import React from "react"

// isHidden:    true = celda oculta que el jugador completa
// value:       número actual (null si vacío)
// isConfirmed: true = tiene par válido confirmado
// isActive:    true = modal de par abierto sobre esta celda
// onClick:     callback al hacer click (solo celdas ocultas)

function BottomCell({ value, isHidden, isConfirmed, isActive, onClick }) {
  if (!isHidden) {
    return <div className="bottom-cell bottom-cell--given">{value}</div>
  }

  let cls = "bottom-cell bottom-cell--hidden"
  if (isActive)         cls += " bottom-cell--active"
  else if (isConfirmed) cls += " bottom-cell--confirmed"

  return (
    <div
      className={cls}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={e => e.key === "Enter" && onClick?.()}
    >
      {value ?? "?"}
    </div>
  )
}

export default React.memo(BottomCell)
