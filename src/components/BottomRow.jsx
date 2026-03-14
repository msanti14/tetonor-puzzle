// =============================================
// TETONOR - Fila Inferior
// src/components/BottomRow.jsx
// =============================================

import React, { useMemo } from "react"
import BottomCell from "./BottomCell"

function BottomRow({
  bottomNumbers,   // solución real (longitud de la fila)
  hiddenIndices,   // índices que el jugador completa
  userAnswers,     // array paralelo con valores del jugador (null = vacío)
  confirmedPairs,  // [{ idxA }] — índices con par confirmado
  activeIndex,     // índice con modal abierto (null si ninguno)
  onCellClick,     // (idx) => void
}) {
  const confirmedSet = useMemo(
    () => new Set(confirmedPairs.map(p => p.idxA)),
    [confirmedPairs]
  )

  return (
    <div className="bottom-row">
      {bottomNumbers.map((_, idx) => {
        const isHidden = hiddenIndices.includes(idx)
        return (
          <BottomCell
            key={idx}
            value={isHidden ? userAnswers[idx] : bottomNumbers[idx]}
            isHidden={isHidden}
            isConfirmed={confirmedSet.has(idx)}
            isActive={activeIndex === idx}
            onClick={isHidden ? () => onCellClick(idx) : undefined}
          />
        )
      })}
    </div>
  )
}

export default React.memo(BottomRow)
