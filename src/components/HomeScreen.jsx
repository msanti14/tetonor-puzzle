// =============================================
// TETONOR - Pantalla Inicial
// src/components/HomeScreen.jsx
// =============================================

import React, { useState, useEffect } from 'react'
import { getDailyPuzzle, getRandomPuzzle } from '../utils/puzzles'
import { SESSION_KEY, DIFFICULTY_LABELS } from '../constants'

function hasTodaySession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY)
    if (!raw) return false
    const data = JSON.parse(raw)
    return data.date === new Date().toDateString() && data.puzzleId !== undefined
  } catch {
    return false
  }
}

// ── Preview animado ───────────────────────────────────────────────────────────
// Puzzle: fila [3, ?, ?, 5]  →  grilla [8, 15, 7, 20]
// 3+5=8 ✅  3×5=15 ✅  3+4=7 ✅  4×5=20 ✅  (solución: ?=2, ?=4)

const PREVIEW_GRID = [8, 15, 7, 20]
const PREVIEW_BOTTOM = [3, null, null, 5] // null = celda oculta
const PHASES = [
  { delay: 1200, answers: [null, null, null, null], solved: false }, // 0: espera inicial
  { delay: 900, answers: [null, 2, null, null], solved: false }, // 1: tipea "2"
  { delay: 900, answers: [null, 2, 4, null], solved: false }, // 2: tipea "4"
  { delay: 800, answers: [null, 2, 4, null], solved: true }, // 3: verifica → verde
  { delay: 1800, answers: [null, 2, 4, null], solved: true }, // 4: pausa resuelto
]

function GamePreview() {
  const [phaseIdx, setPhaseIdx] = useState(0)

  useEffect(() => {
    const phase = PHASES[phaseIdx]
    const id = setTimeout(() => {
      setPhaseIdx((prev) => (prev + 1) % PHASES.length)
    }, phase.delay)
    return () => clearTimeout(id)
  }, [phaseIdx])

  const { answers, solved } = PHASES[phaseIdx]
  const currentBottom = PREVIEW_BOTTOM.map((val, i) => (val !== null ? val : answers[i]))

  return (
    <div className="preview-wrapper">
      <p className="preview-label">así se juega</p>

      <div className="preview-grid">
        {PREVIEW_GRID.map((val, i) => (
          <div key={i} className={`preview-cell ${solved ? 'preview-cell--solved' : ''}`}>
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
            <div
              key={i}
              className={`preview-bcell ${
                isHidden
                  ? isFilled
                    ? 'preview-bcell--filled'
                    : 'preview-bcell--empty'
                  : 'preview-bcell--given'
              }`}
            >
              {val ?? '?'}
            </div>
          )
        })}
      </div>

      {solved && <div className="preview-success">¡correcto! 🎉</div>}
    </div>
  )
}

// ── HowToPlay Stepper ─────────────────────────────────────────────────────
const HOWTO_STEPS = [
  {
    title: 'La Grilla Inferior',
    desc: 'Cada número de abajo debe formar un Par. Para que el par sea válido, tanto su SUMA como su PRODUCTO deben aparecer en la Grilla Superior. Si no aparecen ambos, el par no es válido.',
    grid: null,
    highlight: null,
    bottom: [3, 5, null, 2],
    extra: null,
    pulseIndex: [2],
  },
  {
    title: 'La Grilla Superior',
    desc: 'Cada número de la Grilla Superior es el resultado de la SUMA de un par de abajo, Y de la MULTIPLICACIÓN de otro. Cada número representa AL MENOS una suma y una multiplicación posible.',
    grid: [8, 15, 7, 12],
    highlight: 'all',
    bottom: null,
    extra: <div className="howto-extra-text">← sumas y productos de los pares</div>,
  },
  {
    title: 'El Objetivo',
    desc: 'Calculá qué números faltan en la Grilla Inferior. Cada número oculto (?) debe satisfacer la regla: su par debe tener suma Y producto presentes en la Grilla Superior.',
    grid: [8, 15, 7, 12],
    highlight: null,
    bottom: [3, 5, null, 2],
    extra: (
      <>
        <div className="howto-arrow-connect"></div>
        <div className="howto-equation">3 + ? = 7 &nbsp;·&nbsp; 3 × ? = 12</div>
      </>
    ),
  },
  {
    title: 'Cómo Jugar',
    desc: 'Seleccioná un número de la fila inferior y proponé su compañero de par. El juego verifica si (a+b) y (a×b) aparecen en la Grilla Superior. ¡Un número puede tener más de un par válido posible!',
    grid: [8, 15, 7, 12],
    highlight: 'solved',
    bottom: [3, 5, 4, 2],
    extra: (
      <div className="howto-solved">
        3 + 4 = 7 ✓ &nbsp;·&nbsp; 3 × 4 = 12 ✓<br />
        ¡Resuelto! 🎉
      </div>
    ),
  },
]

function HowToPlay() {
  const [step, setStep] = useState(0)
  const [isPlaying, setIsPlaying] = useState(true)

  useEffect(() => {
    if (!isPlaying) return
    const id = setTimeout(() => setStep((s) => (s + 1) % HOWTO_STEPS.length), 4500)
    return () => clearTimeout(id)
  }, [step, isPlaying])

  const go = (idx) => setStep(idx)
  const prev = () => setStep((s) => (s - 1 + HOWTO_STEPS.length) % HOWTO_STEPS.length)
  const next = () => setStep((s) => (s + 1) % HOWTO_STEPS.length)
  const togglePlay = () => setIsPlaying((p) => !p)

  const { title, desc, grid, highlight, bottom, extra, pulseIndex } = HOWTO_STEPS[step]

  return (
    <div className="preview-wrapper howto-wrapper">
      <div className="howto-step-title">{title}</div>
      <div className="howto-step-desc">{desc}</div>
      <div className="howto-visual">
        {grid && (
          <div className="preview-grid howto-grid">
            {[0, 1, 2, 3].map((i) => {
              let cls = 'preview-cell'
              if (highlight === 'all') cls += ' howto-cell--highlight'
              if (highlight === 'solved') cls += ' howto-cell--solved'
              return (
                <div key={i} className={cls}>
                  {grid[i]}
                </div>
              )
            })}
          </div>
        )}
        {grid && step === 1 && <div className="howto-extra-text">{extra}</div>}
        {bottom && (
          <div className="preview-bottom howto-bottom">
            {bottom.map((val, i) => {
              let cls = 'preview-bcell'
              if (val === null) cls += ' preview-bcell--empty'
              else cls += ' preview-bcell--given'
              if (pulseIndex && pulseIndex.includes(i)) cls += ' howto-bcell--pulse'
              return (
                <div key={i} className={cls}>
                  {val ?? '?'}
                </div>
              )
            })}
          </div>
        )}
        {extra}
      </div>
      <div className="howto-nav">
        <button className="ctrl-btn howto-arrow" onClick={prev} aria-label="Anterior">
          ‹
        </button>
        <div className="howto-dots">
          {HOWTO_STEPS.map((_, i) => (
            <button
              key={i}
              className={'howto-dot' + (i === step ? ' howto-dot--active' : '')}
              onClick={() => go(i)}
              aria-label={`Paso ${i + 1}`}
            ></button>
          ))}
        </div>
        <button className="ctrl-btn howto-arrow" onClick={next} aria-label="Siguiente">
          ›
        </button>
        <button
          className="ctrl-btn howto-play"
          onClick={togglePlay}
          aria-label={isPlaying ? 'Pausar' : 'Reproducir'}
        >
          {isPlaying ? '⏸' : '▶'}
        </button>
      </div>
    </div>
  )
}

// ── Componente principal ──────────────────────────────────────────────────────

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
            {[1, 2, 3].map((level) => (
              <button
                key={level}
                className={`diff-btn ${selectedDifficulty === level ? 'active' : ''}`}
                onClick={() => setSelectedDifficulty((prev) => (prev === level ? null : level))}
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
          <button
            className="btn-primary"
            onClick={() => onStartNew(getRandomPuzzle(selectedDifficulty))}
          >
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
        <HowToPlay />
      </div>
    </div>
  )
}
