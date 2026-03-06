// =============================================
// TETONOR - Pantalla Inicial
// src/components/HomeScreen.jsx
// =============================================

import React, { useState } from "react"
import puzzles from "../data/puzzles.json"

// ── Utilidades ───────────────────────────────────────────────────────────────

/**
 * Selecciona el puzzle del día usando la fecha como seed.
 * El mismo día siempre devuelve el mismo puzzle.
 */
function getDailyPuzzle() {
  const today = new Date()
  const seed =
    today.getFullYear() * 10000 +
    (today.getMonth() + 1) * 100 +
    today.getDate()
  const index = seed % puzzles.length
  return puzzles[index]
}

/**
 * Selecciona un puzzle aleatorio, opcionalmente filtrado por dificultad.
 * @param {number|null} difficulty - 1, 2, 3 o null para cualquiera
 */
function getRandomPuzzle(difficulty) {
  const pool =
    difficulty !== null
      ? puzzles.filter(p => p.difficulty === difficulty)
      : puzzles
  const index = Math.floor(Math.random() * pool.length)
  return pool[index]
}

/**
 * Verifica si hay una partida guardada hoy en localStorage.
 */
function hasTodaySession() {
  try {
    const raw = localStorage.getItem("tetonor_session")
    if (!raw) return false
    const data = JSON.parse(raw)
    const today = new Date().toDateString()
    return data.date === today && data.puzzleId !== undefined
  } catch {
    return false
  }
}

// ── Labels de dificultad ─────────────────────────────────────────────────────

const DIFFICULTY_LABELS = {
  1: "Fácil",
  2: "Medio",
  3: "Difícil",
}

const THEME_OPTIONS = [
  { value: "light", icon: "☀️",  label: "Claro"  },
  { value: "dark",  icon: "🌙",  label: "Oscuro" },
  { value: "party", icon: "🎉",  label: "Fiesta" },
]

// ── Componente ───────────────────────────────────────────────────────────────

export default function HomeScreen({
  onStartDaily,
  onStartNew,
  onResume,
  theme,
  onThemeChange,
}) {
  const [selectedDifficulty, setSelectedDifficulty] = useState(null)
  const canResume = hasTodaySession()

  function handleDifficulty(level) {
    // Toggle: si ya estaba seleccionado, deseleccionar
    setSelectedDifficulty(prev => (prev === level ? null : level))
  }

  function handleStartDaily() {
    const puzzle = getDailyPuzzle()
    onStartDaily(puzzle)
  }

  function handleStartNew() {
    const puzzle = getRandomPuzzle(selectedDifficulty)
    onStartNew(puzzle)
  }

  return (
    <div className="home-screen">

      {/* Título */}
      <header className="home-header">
        <h1 className="home-title">TETONOR</h1>
        <p className="home-subtitle">puzzle matemático</p>
      </header>

      {/* Selector de dificultad */}
      <section className="home-section">
        <p className="home-label">Dificultad para nuevo puzzle</p>
        <div className="difficulty-group">
          {[1, 2, 3].map(level => (
            <button
              key={level}
              className={`diff-btn ${selectedDifficulty === level ? "active" : ""}`}
              onClick={() => handleDifficulty(level)}
            >
              {DIFFICULTY_LABELS[level]}
            </button>
          ))}
        </div>
        {selectedDifficulty === null && (
          <p className="home-hint">Sin selección → dificultad aleatoria</p>
        )}
      </section>

      {/* Botones principales */}
      <section className="home-section home-buttons">
        <button className="btn-primary" onClick={handleStartDaily}>
          📅 Puzzle del día
        </button>

        <button className="btn-primary" onClick={handleStartNew}>
          🎲 Nuevo puzzle
        </button>

        {canResume && (
          <button className="btn-secondary" onClick={onResume}>
            ▶ Reanudar
          </button>
        )}
      </section>

      {/* Toggle de tema */}
      <section className="home-section theme-toggle">
        {THEME_OPTIONS.map(opt => (
          <button
            key={opt.value}
            className={`theme-btn ${theme === opt.value ? "active" : ""}`}
            onClick={() => onThemeChange(opt.value)}
            title={opt.label}
          >
            {opt.icon}
          </button>
        ))}
      </section>

    </div>
  )
}
