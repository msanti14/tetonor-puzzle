// =============================================
// TETONOR - Tablero de Juego
// src/components/GameBoard.jsx
// =============================================

import React, { useState, useEffect } from "react"
import TopGrid from "./TopGrid"
import BottomRow from "./BottomRow"
import { validateGrid, isPuzzleSolved } from "../engine/puzzleValidator"
import puzzles from "../data/puzzles.json"

const DIFFICULTY_LABELS = { 1: "Fácil", 2: "Medio", 3: "Difícil" }

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

export default function GameBoard({
  puzzle,
  savedAnswers,
  savedHiddenIndices,
  timer,
  theme,
  onThemeChange,
  onGoHome,
  onStartNew,
  onSaveSession,
}) {

  const [hiddenIndices, setHiddenIndices] = useState(() =>
    savedHiddenIndices ??
    generateHiddenIndices(puzzle.bottomNumbers.length, puzzle.hiddenCount)
  )

  const [userAnswers, setUserAnswers] = useState(() =>
    savedAnswers ?? Array(puzzle.bottomNumbers.length).fill(null)
  )

  const [verifyResult, setVerifyResult]   = useState(null)
  const [isSolved, setIsSolved]           = useState(false)
  const [selectedDifficulty, setSelectedDifficulty] = useState(null)

  // Resetear cuando cambia el puzzle
  useEffect(() => {
    const hidden = savedHiddenIndices ??
      generateHiddenIndices(puzzle.bottomNumbers.length, puzzle.hiddenCount)
    setHiddenIndices(hidden)
    setUserAnswers(savedAnswers ?? Array(puzzle.bottomNumbers.length).fill(null))
    setVerifyResult(null)
    setIsSolved(false)
  }, [puzzle.id])

  // Fila actual para el validador
  const currentBottom = puzzle.bottomNumbers.map((val, idx) =>
    hiddenIndices.includes(idx) ? userAnswers[idx] : val
  )

  function handleAnswerChange(index, value) {
    const newAnswers = [...userAnswers]
    newAnswers[index] = value
    setUserAnswers(newAnswers)
    setVerifyResult(null)
    onSaveSession(puzzle, newAnswers, hiddenIndices)
  }

  function handleVerify() {
    const result = validateGrid(puzzle.topGrid, currentBottom)
    setVerifyResult(result)
    if (isPuzzleSolved(puzzle.topGrid, currentBottom)) {
      setIsSolved(true)
      timer.pause()
      triggerConfetti()
    }
  }

  function handleNewPuzzle() {
    const next = getRandomPuzzle(selectedDifficulty)
    onStartNew(next)
  }

  function triggerConfetti() {
    import("canvas-confetti").then(({ default: confetti }) => {
      confetti({ particleCount: 120, spread: 80, origin: { y: 0.4 } })
    }).catch(() => {})
  }

  return (
    <div className="game-board">

      {/* Header */}
      <header className="game-header">
        <h1 className="game-title">TETONOR</h1>
        <div className="theme-toggle">
          {[
            { value: "light", icon: "☀️" },
            { value: "dark",  icon: "🌙" },
            { value: "party", icon: "🎉" },
          ].map(opt => (
            <button
              key={opt.value}
              className={`theme-btn ${theme === opt.value ? "active" : ""}`}
              onClick={() => onThemeChange(opt.value)}
            >
              {opt.icon}
            </button>
          ))}
        </div>
      </header>

      {/* Controles superiores */}
      <div className="game-controls">
        <button
          className="btn btn--secondary"
          onClick={onGoHome}
        >
          ← Inicio
        </button>

        <div className="new-puzzle-group">
          <div className="difficulty-group">
            {[1, 2, 3].map(level => (
              <button
                key={level}
                className={`diff-btn ${selectedDifficulty === level ? "active" : ""}`}
                onClick={() =>
                  setSelectedDifficulty(prev => prev === level ? null : level)
                }
              >
                {DIFFICULTY_LABELS[level]}
              </button>
            ))}
          </div>
          <button className="btn btn--primary" onClick={handleNewPuzzle}>
            🎲 Nuevo
          </button>
        </div>
      </div>

      {/* Info del puzzle */}
      <div className="puzzle-info">
        <span className="puzzle-badge">{DIFFICULTY_LABELS[puzzle.difficulty]}</span>
        <span className="puzzle-id">#{puzzle.id}</span>
      </div>

      {/* Grilla superior */}
      <TopGrid topGrid={puzzle.topGrid} verifyResult={verifyResult} />

      {/* Separador */}
      <div className="grid-separator">
        <span className="grid-separator__label">a+b · a×b</span>
      </div>

      {/* Fila inferior */}
      <BottomRow
        bottomNumbers={puzzle.bottomNumbers}
        hiddenIndices={hiddenIndices}
        userAnswers={userAnswers}
        onAnswerChange={handleAnswerChange}
      />

      {/* Footer */}
      <div className="game-footer">
        <div className="timer">
          <span className="timer__icon">{timer.isRunning ? "⏱" : "⏸"}</span>
          <span className="timer__display">{timer.formatted}</span>
        </div>

        {!isSolved ? (
          <button className="btn btn--verify" onClick={handleVerify}>
            Verificar
          </button>
        ) : (
          <div className="solved-message">¡Resuelto! 🎉</div>
        )}
      </div>

    </div>
  )
}
