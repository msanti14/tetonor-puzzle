// =============================================
// TETONOR - Grilla 4x4 Superior
// src/components/TopGrid.jsx
// =============================================

import React from "react"
import Cell from "./Cell"

export default function TopGrid({ topGrid, verifyResult }) {
  // topGrid: array plano de 16 números
  // verifyResult: array de 16 booleanos | null (antes de verificar)

  // Convertir array plano a filas de 4
  const rows = []
  for (let i = 0; i < 16; i += 4) {
    rows.push(topGrid.slice(i, i + 4))
  }

  return (
    <div className="top-grid">
      {rows.map((row, rowIdx) => (
        <div key={rowIdx} className="top-grid__row">
          {row.map((value, colIdx) => {
            const flatIdx = rowIdx * 4 + colIdx

            // Determinar status de la celda
            let status = null
            if (verifyResult !== null) {
              status = verifyResult[flatIdx] ? "correct" : "wrong"
            }

            return (
              <Cell
                key={flatIdx}
                value={value}
                status={status}
              />
            )
          })}
        </div>
      ))}
    </div>
  )
}
