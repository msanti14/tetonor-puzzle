// =============================================
// TETONOR - Utilidades de puzzles
// =============================================

import puzzlesData from "../data/puzzles.json"

// Algunos bundlers exportan JSON como { default: [...] }
const puzzles = Array.isArray(puzzlesData) ? puzzlesData : (puzzlesData?.default ?? [])

export function getDailyPuzzle() {
  if (puzzles.length === 0) return null
  const today = new Date()
  const seed  = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate()
  return puzzles[seed % puzzles.length]
}

export function getRandomPuzzle(difficulty) {
  const pool = difficulty !== null
    ? puzzles.filter(p => p.difficulty === difficulty)
    : puzzles
  if (pool.length === 0) return null
  return pool[Math.floor(Math.random() * pool.length)]
}

export function generateHiddenIndices(total, hiddenCount) {
  const indices = Array.from({ length: total }, (_, i) => i)
  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [indices[i], indices[j]] = [indices[j], indices[i]]
  }
  return indices.slice(0, hiddenCount).sort((a, b) => a - b)
}
