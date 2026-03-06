// =============================================
// TETONOR - Generador de Puzzles
// Ejecutar con: node generatePuzzles.js
// Output: copia el resultado en src/data/puzzles.json
// =============================================

// ── Configuración por dificultad ──────────────────────────────────────────────
const DIFFICULTY_CONFIG = {
  1: {
    label: "fácil",
    baseCount: 12,       // números en la fila base
    hiddenCount: 3,      // celdas ocultas al jugador
    baseMin: 1,          // rango mínimo fila
    baseMax: 15,         // rango máximo fila
    gridMax: 50,         // valor máximo permitido en la grilla
    maxRepeats: 2,       // máximo de repeticiones de un número en la fila
  },
  2: {
    label: "medio",
    baseCount: 10,
    hiddenCount: 5,
    baseMin: 5,
    baseMax: 30,
    gridMax: 100,
    maxRepeats: 2,
  },
  3: {
    label: "difícil",
    baseCount: 8,
    hiddenCount: 7,
    baseMin: 10,
    baseMax: 50,
    gridMax: 500,
    maxRepeats: 2,
  },
}

const PUZZLES_PER_DIFFICULTY = 400   // 400 × 3 = 1200 puzzles totales
const GRID_SIZE = 16                 // grilla 4x4

// ── Utilidades ────────────────────────────────────────────────────────────────

function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

// Mezcla un array (Fisher-Yates)
function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

// ── Paso 1: Generar fila base ─────────────────────────────────────────────────
// Números aleatorios dentro del rango, respetando máximo de repeticiones

function generateBase(config) {
  const { baseCount, baseMin, baseMax, maxRepeats } = config
  const counts = {}
  const base = []
  let attempts = 0
  const maxAttempts = 10000

  while (base.length < baseCount && attempts < maxAttempts) {
    attempts++
    const n = rand(baseMin, baseMax)
    counts[n] = counts[n] || 0
    if (counts[n] < maxRepeats) {
      base.push(n)
      counts[n]++
    }
  }

  // Si no se pudo llenar (rango muy chico), lanzar error
  if (base.length < baseCount) return null

  return base.sort((a, b) => a - b)
}

// ── Paso 2: Generar pool de combinaciones ─────────────────────────────────────
// Para cada par (a, b) de la fila base, calcular a+b y a×b
// Devuelve un Set de valores válidos dentro del rango de la grilla

function buildCombinationPool(base, gridMax) {
  const pool = new Set()

  for (let i = 0; i < base.length; i++) {
    for (let j = i; j < base.length; j++) {
      const a = base[i]
      const b = base[j]

      const sum = a + b
      const prod = a * b

      if (sum > 0 && sum <= gridMax) pool.add(sum)
      if (prod > 0 && prod <= gridMax) pool.add(prod)
    }
  }

  return pool
}

// ── Paso 3: Seleccionar 16 valores únicos para la grilla ──────────────────────

function selectGridValues(pool) {
  const available = shuffle(Array.from(pool))
  if (available.length < GRID_SIZE) return null
  return available.slice(0, GRID_SIZE)
}

// ── Paso 4: Validar que cada celda de la grilla tiene explicación ─────────────
// Cada valor debe poder escribirse como a+b o a×b con a,b ∈ base

function validateGrid(gridValues, base) {
  return gridValues.every(val => canExplain(val, base))
}

function canExplain(val, base) {
  for (let i = 0; i < base.length; i++) {
    for (let j = i; j < base.length; j++) {
      if (base[i] + base[j] === val) return true
      if (base[i] * base[j] === val) return true
    }
  }
  return false
}

// ── Paso 5: Generar un puzzle completo ───────────────────────────────────────
// Reintenta hasta obtener uno válido

function generatePuzzle(difficulty, id) {
  const config = DIFFICULTY_CONFIG[difficulty]
  const MAX_RETRIES = 200

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {

    // 1. Generar fila base
    const base = generateBase(config)
    if (!base) continue

    // 2. Construir pool de combinaciones posibles
    const pool = buildCombinationPool(base, config.gridMax)
    if (pool.size < GRID_SIZE) continue

    // 3. Seleccionar 16 valores para la grilla
    const gridValues = selectGridValues(pool)
    if (!gridValues) continue

    // 4. Validar (doble check — debería pasar siempre si el pool es correcto)
    if (!validateGrid(gridValues, base)) continue

    // 5. Armar el objeto final
    return {
      id,
      difficulty,
      topGrid: gridValues,         // array plano de 16 números
      bottomNumbers: base,         // solución completa de la fila
      hiddenCount: config.hiddenCount,
    }
  }

  // Si después de MAX_RETRIES no se pudo generar, retornar null
  console.error(`⚠️  No se pudo generar puzzle id=${id} difficulty=${difficulty}`)
  return null
}

// ── Generación masiva ─────────────────────────────────────────────────────────

function generateAll() {
  const puzzles = []
  let id = 1

  for (const difficulty of [1, 2, 3]) {
    const config = DIFFICULTY_CONFIG[difficulty]
    let generated = 0
    let failed = 0

    console.error(`\nGenerando ${PUZZLES_PER_DIFFICULTY} puzzles ${config.label}...`)

    while (generated < PUZZLES_PER_DIFFICULTY) {
      const puzzle = generatePuzzle(difficulty, id)
      if (puzzle) {
        puzzles.push(puzzle)
        generated++
        id++
      } else {
        failed++
        if (failed > 50) {
          console.error(`❌ Demasiados fallos en difficulty=${difficulty}. Revisá los rangos.`)
          break
        }
      }
    }

    console.error(`✅ ${generated} puzzles generados (${failed} fallos)`)
  }

  return puzzles
}

// ── Entry point ───────────────────────────────────────────────────────────────

const puzzles = generateAll()

console.error(`\n📦 Total: ${puzzles.length} puzzles generados`)
console.error(`📝 Copiá el output en src/data/puzzles.json\n`)

// Imprimir ejemplos de cada dificultad para verificar
for (const d of [1, 2, 3]) {
  const example = puzzles.find(p => p.difficulty === d)
  const config = DIFFICULTY_CONFIG[d]
  console.error(`── Ejemplo dificultad ${d} (${config.label}) ──`)
  console.error(`   fila base:  [${example.bottomNumbers.join(', ')}]`)
  console.error(`   grilla:     [${example.topGrid.join(', ')}]`)
  console.error(`   ocultos:    ${example.hiddenCount}`)
  console.error()
}

// Output JSON
console.log(JSON.stringify(puzzles, null, 2))
