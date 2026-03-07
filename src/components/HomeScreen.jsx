// =============================================
// TETONOR - Pantalla Inicial
// src/components/HomeScreen.jsx
// =============================================

import React, { useState, useEffect } from "react"
import puzzles from "../data/puzzles.json"

function getDailyPuzzle() {
  const today = new Date()
  const seed  = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate()
  return puzzles[seed % puzzles.length]
}

function getRandomPuzzle(difficulty) {
  const pool = difficulty !== null ? puzzles.filter(p => p.difficulty === difficulty) : puzzles
  return pool[Math.floor(Math.random() * pool.length)]
}

function hasTodaySession() {
  try {
    const raw  = localStorage.getItem("tetonor_session")
    if (!raw) return false
    const data = JSON.parse(raw)
    return data.date === new Date().toDateString() && data.puzzleId !== undefined
  } catch { return false }
}

// ── Preview animado ───────────────────────────────────────────────────────────
// Puzzle: fila [3, ?, ?, 5]  →  grilla [8, 15, 7, 20]
// 3+5=8 ✅  3×5=15 ✅  3+4=7 ✅  4×5=20 ✅  (solución: ?=2, ?=4)

const PREVIEW_GRID   = [8, 15, 7, 20]
const PREVIEW_BOTTOM = [3, null, null, 5]   // null = celda oculta
const PHASES = [
  { delay: 1200, answers: [null, null, null, null], solved: false }, // 0: espera inicial
  { delay: 900,  answers: [null, 2,    null, null], solved: false }, // 1: tipea "2"
  { delay: 900,  answers: [null, 2,    4,    null], solved: false }, // 2: tipea "4"
  { delay: 800,  answers: [null, 2,    4,    null], solved: true  }, // 3: verifica → verde
  { delay: 1800, answers: [null, 2,    4,    null], solved: true  }, // 4: pausa resuelto
]

function GamePreview() {
  const [phaseIdx, setPhaseIdx] = useState(0)

  useEffect(() => {
    const phase = PHASES[phaseIdx]
    const id = setTimeout(() => {
      setPhaseIdx(prev => (prev + 1) % PHASES.length)
    }, phase.delay)
    return () => clearTimeout(id)
  }, [phaseIdx])

  const { answers, solved } = PHASES[phaseIdx]
  const currentBottom = PREVIEW_BOTTOM.map((val, i) => val !== null ? val : answers[i])

  return (
    <div className="preview-wrapper">
      <p className="preview-label">así se juega</p>

      <div className="preview-grid">
        {PREVIEW_GRID.map((val, i) => (
          <div key={i} className={`preview-cell ${solved ? "preview-cell--solved" : ""}`}>
            {val}
          </div>
        ))}
      </div>

      <div className="preview-separator">a+b · a×b</div>

      <div className="preview-bottom">
        {currentBottom.map((val, i) => {
          const isHidden = PREVIEW_BOTTOM[i] === null
          const isFilled = isHidden && val !== null
          return (
            <div key={i} className={`preview-bcell ${
              isHidden
                ? isFilled ? "preview-bcell--filled" : "preview-bcell--empty"
                : "preview-bcell--given"
            }`}>
              {val ?? "?"}
            </div>
          )
        })}
      </div>

      {solved && <div className="preview-success">¡correcto! 🎉</div>}
    </div>
  )
}

// ── Componente principal ──────────────────────────────────────────────────────

const DIFFICULTY_LABELS = { 1: "Fácil", 2: "Medio", 3: "Difícil" }

export default function HomeScreen({ onStartDaily, onStartNew, onResume }) {
  const [selectedDifficulty, setSelectedDifficulty] = useState(null)
  const canResume = hasTodaySession()

  return (
    <div className="home-screen">

      {/* Columna izquierda: controles */}
      <div className="home-left">
        <header className="home-header">
          <h1 className="home-title">TETONOR</h1>
          <p className="home-subtitle">puzzle matemático</p>
        </header>

        <section className="home-section">
          <p className="home-label">Dificultad para nuevo puzzle</p>
          <div className="difficulty-group">
            {[1, 2, 3].map(level => (
              <button
                key={level}
                className={`diff-btn ${selectedDifficulty === level ? "active" : ""}`}
                onClick={() => setSelectedDifficulty(prev => prev === level ? null : level)}
              >
                {DIFFICULTY_LABELS[level]}
              </button>
            ))}
          </div>
          {selectedDifficulty === null && (
            <p className="home-hint">Sin selección → dificultad aleatoria</p>
          )}
        </section>

        <section className="home-section home-buttons">
          <button className="btn-primary" onClick={() => onStartDaily(getDailyPuzzle())}>
            📅 Puzzle del día
          </button>
          <button className="btn-primary" onClick={() => onStartNew(getRandomPuzzle(selectedDifficulty))}>
            🎲 Nuevo puzzle
          </button>
          {canResume && (
            <button className="btn-secondary" onClick={onResume}>
              ▶ Reanudar
            </button>
          )}
        </section>
      </div>

      {/* Columna derecha: preview animado */}
      {/* En mobile queda abajo gracias a `order: 1` en CSS */}
      <div className="home-right">
        <GamePreview />
      </div>

    </div>
  )
}
