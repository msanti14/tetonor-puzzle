// =============================================
// TETONOR - Motor de Validación
// src/engine/puzzleValidator.js
// =============================================

/**
 * Verifica si un valor puede explicarse como a+b o a×b
 * usando dos números de la fila base (ignorando nulls).
 *
 * Los índices i y j pueden ser iguales SOLO si el mismo
 * número aparece más de una vez en la fila.
 *
 * Ejemplos:
 *   canExplain(24, [2, 3, 8, 12]) → true  (2×12 o 3×8)
 *   canExplain(9,  [3, 3, 5])     → true  (3×3)
 *   canExplain(9,  [3, 5, 7])     → false (no hay par válido)
 *   canExplain(24, [2, null, 12]) → true  (2×12, ignora null)
 */
export function canExplain(value, bottomNumbers) {
  const nums = bottomNumbers.filter(n => n !== null && n !== undefined)

  for (let i = 0; i < nums.length; i++) {
    for (let j = i; j < nums.length; j++) {
      // i === j significa usar el mismo número dos veces:
      // solo válido si ese número aparece al menos dos veces en la fila
      if (i === j) {
        const count = nums.filter(n => n === nums[i]).length
        if (count < 2) continue
      }
      if (nums[i] + nums[j] === value) return true
      if (nums[i] * nums[j] === value) return true
    }
  }

  return false
}

/**
 * Devuelve todas las expresiones que explican un valor.
 * Útil para mostrar hints al jugador.
 *
 * Ejemplo:
 *   getExplanations(24, [2, 3, 8, 12])
 *   → ["3+21"... no, → ["2×12", "3×8"]
 */
export function getExplanations(value, bottomNumbers) {
  const nums = bottomNumbers.filter(n => n !== null && n !== undefined)
  const explanations = []

  for (let i = 0; i < nums.length; i++) {
    for (let j = i; j < nums.length; j++) {
      if (i === j) {
        const count = nums.filter(n => n === nums[i]).length
        if (count < 2) continue
      }
      const a = nums[i]
      const b = nums[j]
      if (a + b === value) explanations.push(`${a}+${b}`)
      if (a * b === value) explanations.push(`${a}×${b}`)
    }
  }

  return [...new Set(explanations)]
}

/**
 * Valida toda la TopGrid contra la fila base actual.
 * Devuelve un array de booleanos, uno por celda.
 *
 * Ejemplo:
 *   validateGrid([24, 5, 100], [2, 3, 8, 12])
 *   → [true, true, false]
 */
export function validateGrid(topGrid, bottomNumbers) {
  return topGrid.map(value => canExplain(value, bottomNumbers))
}

/**
 * Verifica si el puzzle está completamente resuelto:
 * - No hay celdas vacías en la fila
 * - Todos los valores de la grilla están explicados
 *
 * Ejemplo:
 *   isPuzzleSolved([24, 5], [2, 3, 8, 12]) → true
 *   isPuzzleSolved([24, 5], [2, null, 8])  → false (hay null)
 *   isPuzzleSolved([24, 99], [2, 3, 8, 12])→ false (99 no explicado)
 */
export function isPuzzleSolved(topGrid, bottomNumbers) {
  const hasEmpty = bottomNumbers.some(n => n === null || n === undefined)
  if (hasEmpty) return false

  return topGrid.every(value => canExplain(value, bottomNumbers))
}
