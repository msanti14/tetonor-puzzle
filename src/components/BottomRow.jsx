// =============================================
// TETONOR - Fila Inferior
// src/components/BottomRow.jsx
// =============================================

import React from "react"
import BottomCell from "./BottomCell"

export default function BottomRow({ bottomNumbers, hiddenIndices, userAnswers, onAnswerChange }) {
  // bottomNumbers: array completo (la solución, solo para saber cuántas celdas hay)
  // hiddenIndices: array de índices que el jugador debe completar
  // userAnswers:   array paralelo a bottomNumbers con lo que escribió el jugador
  //                (null en posiciones vacías, número en posiciones completadas)
  // onAnswerChange(index, value): callback cuando el jugador ingresa un número

  return (
    <div className="bottom-row">
      {bottomNumbers.map((_, idx) => {
        const isHidden = hiddenIndices.includes(idx)

        return (
          <BottomCell
            key={idx}
            value={isHidden ? userAnswers[idx] : bottomNumbers[idx]}
            isHidden={isHidden}
            onChange={(value) => onAnswerChange(idx, value)}
          />
        )
      })}
    </div>
  )
}
