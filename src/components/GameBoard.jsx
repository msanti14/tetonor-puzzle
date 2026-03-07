// =============================================
// TETONOR - Tablero de Juego
// src/components/GameBoard.jsx
// =============================================

import React, { useState, useEffect, useMemo } from "react"
import TopGrid   from "./TopGrid"
import BottomRow from "./BottomRow"
import Controls  from "./Controls"
import PairModal from "./PairModal"
import { computeCellStates, isPuzzleSolved } from "../engine/puzzleValidator"
import puzzles from "../data/puzzles.json"

const DIFF = { 1: "Fácil", 2: "Medio", 3: "Difícil" }

function getRandomPuzzle(difficulty) {
  const pool = difficulty !== null
    ? puzzles.filter(p => p.difficulty === difficulty)
    : puzzles
  return pool[Math.floor(Math.random() * pool.length)]
}

function generateHiddenIndices(total, hiddenCount) {
  const indices = Array.from({ length: total }, (_, i) => i)
  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [indices[i], indices[j]] = [indices[j], indices[i]]
  }
  return indices.slice(0, hiddenCount).sort((a, b) => a - b)
}

function triggerConfetti() {
  import("canvas-confetti").then(({ default: c }) =>
    c({ particleCount: 120, spread: 80, origin: { y: 0.4 } })
  ).catch(() => {})
}

export default function GameBoard({
  puzzle, savedAnswers, savedHiddenIndices,
  timer, onGoHome, onStartNew, onSaveSession,
}) {
  const [hiddenIndices, setHiddenIndices] = useState(() =>
    savedHiddenIndices ?? generateHiddenIndices(puzzle.bottomNumbers.length, puzzle.hiddenCount)
  )
  const [userAnswers, setUserAnswers] = useState(() =>
    savedAnswers ?? Array(puzzle.bottomNumbers.length).fill(null)
  )
  // confirmedPairs: [{ idxA, a, idxB, b }]
  const [confirmedPairs, setConfirmedPairs] = useState([])
  const [activeIdx,      setActiveIdx]      = useState(null)
  const [isSolved,       setIsSolved]       = useState(false)
  const [selectedDiff,   setSelectedDiff]   = useState(null)
  const [timerVisible,   setTimerVisible]   = useState(true)
  const [panelVisible,   setPanelVisible]   = useState(true)

  // Resetear al cambiar de puzzle
  useEffect(() => {
    setHiddenIndices(
      savedHiddenIndices ?? generateHiddenIndices(puzzle.bottomNumbers.length, puzzle.hiddenCount)
    )
    setUserAnswers(savedAnswers ?? Array(puzzle.bottomNumbers.length).fill(null))
    setConfirmedPairs([])
    setActiveIdx(null)
    setIsSolved(false)
  }, [puzzle.id])

  // Estado de las celdas de la grilla — recalculado en cada render
  const cellStates = useMemo(
    () => computeCellStates(confirmedPairs, puzzle.topGrid),
    [confirmedPairs, puzzle.topGrid]
  )

  // Victoria — verificar DESPUÉS de que cellStates se actualice
  useEffect(() => {
    if (confirmedPairs.length > 0 && isPuzzleSolved(cellStates)) {
      setIsSolved(true)
      timer.pause()
      triggerConfetti()
    }
  }, [cellStates])

  function handlePairConfirm(value, idxA, idxB) {
    const newAnswers = [...userAnswers]
    newAnswers[idxA] = value
    setUserAnswers(newAnswers)

    // Reemplazar par anterior de esta celda si existía
    const bValue = hiddenIndices.includes(idxB) ? userAnswers[idxB] : puzzle.bottomNumbers[idxB]
    const newPairs = [
      ...confirmedPairs.filter(p => p.idxA !== idxA),
      { idxA, a: value, idxB, b: bValue },
    ]
    setConfirmedPairs(newPairs)
    setActiveIdx(null)
    onSaveSession(puzzle, newAnswers, hiddenIndices)
  }

  function handleReset() {
    const hidden      = generateHiddenIndices(puzzle.bottomNumbers.length, puzzle.hiddenCount)
    const emptyAnswers = Array(puzzle.bottomNumbers.length).fill(null)
    setHiddenIndices(hidden)
    setUserAnswers(emptyAnswers)
    setConfirmedPairs([])
    setActiveIdx(null)
    setIsSolved(false)
    timer.reset()
    onSaveSession(puzzle, emptyAnswers, hidden)
  }

  return (
    <div className="game-layout">

      {/* ── Columna izquierda: juego ── */}
      <div className="game-main">

        <header className="game-header">
          <h1 className="game-title">TETONOR</h1>
        </header>

        <div className="game-controls">
          <button className="btn btn--secondary" onClick={onGoHome}>← Inicio</button>
          <div className="new-puzzle-group">
            <div className="difficulty-group">
              {[1, 2, 3].map(level => (
                <button
                  key={level}
                  className={`diff-btn ${selectedDiff === level ? "active" : ""}`}
                  onClick={() => setSelectedDiff(prev => prev === level ? null : level)}
                >
                  {DIFF[level]}
                </button>
              ))}
            </div>
            <button className="btn btn--primary"
              onClick={() => onStartNew(getRandomPuzzle(selectedDiff))}>
              🎲 Nuevo
            </button>
          </div>
        </div>

        <div className="puzzle-info">
          <span className="puzzle-badge">{DIFF[puzzle.difficulty]}</span>
          <span className="puzzle-id">#{puzzle.id}</span>
        </div>

        <TopGrid topGrid={puzzle.topGrid} cellStates={cellStates} />

        <div className="grid-separator">
          <span className="grid-separator__label">a+b · a×b</span>
        </div>

        <BottomRow
          bottomNumbers={puzzle.bottomNumbers}
          hiddenIndices={hiddenIndices}
          userAnswers={userAnswers}
          confirmedPairs={confirmedPairs}
          activeIndex={activeIdx}
          onCellClick={setActiveIdx}
        />

        <div className="game-footer">
          <button className="timer--btn" onClick={() => setTimerVisible(v => !v)}>
            <span className="timer__icon">{timer.isRunning ? "⏱" : "⏸"}</span>
            <span className="timer__display">
              {timerVisible ? timer.formatted : "••:••"}
            </span>
          </button>

          <div className="footer-mobile-controls mobile-only">
            <Controls onReset={handleReset} mobileMode={true} />
          </div>

          {isSolved && <div className="solved-message">¡Resuelto! 🎉</div>}
        </div>
      </div>

      {/* ── Botón colapsar panel ── */}
      <button
        className={`panel-toggle ${panelVisible ? "" : "panel-toggle--collapsed"}`}
        onClick={() => setPanelVisible(v => !v)}
      >
        {panelVisible ? "◀" : "▶"}
      </button>

      {/* ── Panel derecho: calculadora + anotador ── */}
      {panelVisible && (
        <div className="game-panel desktop-only">
          <Controls onReset={handleReset} mobileMode={false} />
        </div>
      )}

      {/* ── Modal de par ── */}
      {activeIdx !== null && (
        <PairModal
          activeIdx={activeIdx}
          currentValue={userAnswers[activeIdx]}
          bottomNumbers={puzzle.bottomNumbers}
          hiddenIndices={hiddenIndices}
          userAnswers={userAnswers}
          topGrid={puzzle.topGrid}
          onConfirm={handlePairConfirm}
          onCancel={() => setActiveIdx(null)}
        />
      )}

    </div>
  )
}
