// =============================================
// TETONOR - Celda de la TopGrid
// src/components/Cell.jsx
// =============================================

import React from "react"

export default function Cell({ value, status }) {
  // status: null | 'correct' | 'wrong'

  return (
    <div className={`cell ${status ? `cell--${status}` : ""}`}>
      {value}
    </div>
  )
}
