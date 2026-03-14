// =============================================
// TETONOR - Motor de Validación
// src/engine/puzzleValidator.js
// =============================================

/**
 * Un par (a, b) es válido para colocarlo en la fila si
 * tanto a+b como a×b aparecen en topGrid.
 */
export function isPairValid(a, b, topGrid) {
  return topGrid.includes(a + b) && topGrid.includes(a * b)
}

/**
 * Calcula el estado de cada celda de la grilla dado el conjunto
 * de pares confirmados.
 *
 * Devuelve array de 16 objetos:
 *   { status: 'neutral' | 'green' | 'green-full', labels: string[] }
 *
 * - 'neutral'    : ningún par explica esta celda aún
 * - 'green'      : explicada por suma O producto (pero no ambos)
 * - 'green-full' : explicada por al menos un par vía suma
 *                  Y al menos un par vía producto
 *
 * confirmedPairs: [{ a, b }]
 * topGrid:        array de 16 valores
 */
export function computeCellStates(confirmedPairs, topGrid) {
  return topGrid.map(cellValue => {
    let hasBySum     = false
    let hasByProduct = false
    const labels     = []

    for (const { a, b } of confirmedPairs) {
      if (a + b === cellValue) { hasBySum     = true; labels.push(`${a}+${b}`) }
      if (a * b === cellValue) { hasByProduct = true; labels.push(`${a}×${b}`) }
    }

    const status = hasBySum && hasByProduct ? 'green-full'
                 : hasBySum || hasByProduct ? 'green'
                 : 'neutral'

    return { status, labels: [...new Set(labels)] }
  })
}

/**
 * Verifica que todos los números de la fila inferior hayan sido usados
 * como operandos en los pares confirmados.
 *
 * Se requiere que al menos el 80% de los números visibles (no ocultos)
 * hayan sido usados como operandos.
 */
export function areAllBottomNumbersUsed(confirmedPairs, bottomNumbers, hiddenIndices) {
  const visibleNumbers = bottomNumbers.filter((_, index) => !hiddenIndices.includes(index))

  const usedNumbers = new Set()
  confirmedPairs.forEach(({ a, b }) => {
    usedNumbers.add(a)
    usedNumbers.add(b)
  })

  const usedVisibleCount = visibleNumbers.filter(num => usedNumbers.has(num)).length
  const requiredCount = Math.ceil(visibleNumbers.length * 0.8)

  return usedVisibleCount >= requiredCount
}

/**
 * Victoria: todas las celdas en 'green-full' Y al menos el 80% de los números
 * visibles de la fila inferior han sido usados como operandos en pares confirmados.
 */
export function isPuzzleSolved(cellStates, confirmedPairs, bottomNumbers, hiddenIndices) {
  const allCellsGreen = cellStates.every(c => c.status === 'green-full')
  const allBottomNumbersUsed = areAllBottomNumbersUsed(confirmedPairs, bottomNumbers, hiddenIndices)

  return allCellsGreen && allBottomNumbersUsed
}
