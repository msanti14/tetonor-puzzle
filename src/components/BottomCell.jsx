// =============================================
// TETONOR - Celda de la Fila Inferior
// src/components/BottomCell.jsx
// =============================================

import React from "react"

export default function BottomCell({ value, isHidden, onChange }) {
  // value:    número actual (puede ser null si está vacío)
  // isHidden: true = el jugador debe completarla
  // onChange: función que recibe el nuevo valor

  if (!isHidden) {
    // Celda visible: solo muestra el número
    return (
      <div className="bottom-cell bottom-cell--given">
        {value}
      </div>
    )
  }

  // Celda oculta: el jugador tipea con teclado físico
  function handleChange(e) {
    const raw = e.target.value

    // Permitir borrar
    if (raw === "" || raw === null) {
      onChange(null)
      return
    }

    const num = parseInt(raw, 10)
    if (!isNaN(num) && num > 0) {
      onChange(num)
    }
  }

  return (
    <div className="bottom-cell bottom-cell--hidden">
      <input
        className="bottom-cell__input"
        type="number"
        min="1"
        value={value ?? ""}
        onChange={handleChange}
        placeholder="?"
      />
    </div>
  )
}
