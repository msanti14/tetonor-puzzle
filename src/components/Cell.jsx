// =============================================
// TETONOR - Celda de la TopGrid
// src/components/Cell.jsx
// =============================================

import React from "react"

// status: 'neutral' | 'green' | 'green-full'
// labels: string[] — ej: ["3+5", "3×5"]

export default function Cell({ value, status, labels }) {
  const cls = status && status !== 'neutral' ? `cell--${status}` : ""

  return (
    <div className={`cell ${cls}`}>
      <span className="cell__value">{value}</span>
      {labels && labels.length > 0 && (
        <span className="cell__labels">{labels.join(" · ")}</span>
      )}
    </div>
  )
}
