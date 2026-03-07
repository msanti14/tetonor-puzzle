// =============================================
// TETONOR - Grilla 4x4 Superior
// src/components/TopGrid.jsx
// =============================================

import React from "react"
import Cell from "./Cell"

// cellStates: array de 16 { status, labels } | null

export default function TopGrid({ topGrid, cellStates }) {
  const rows = []
  for (let i = 0; i < 16; i += 4) rows.push(topGrid.slice(i, i + 4))

  return (
    <div className="top-grid">
      {rows.map((row, rowIdx) => (
        <div key={rowIdx} className="top-grid__row">
          {row.map((value, colIdx) => {
            const idx   = rowIdx * 4 + colIdx
            const state = cellStates?.[idx]
            return (
              <Cell
                key={idx}
                value={value}
                status={state?.status ?? 'neutral'}
                labels={state?.labels ?? []}
              />
            )
          })}
        </div>
      ))}
    </div>
  )
}
