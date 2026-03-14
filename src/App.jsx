// =============================================
// TETONOR - Componente Raíz
// src/App.jsx
// =============================================

import React, { useState, useEffect, useCallback, useRef } from "react"
import HomeScreen from "./components/HomeScreen"
import GameBoard  from "./components/GameBoard"
import ThemeBar   from "./components/ThemeBar"
import { useTimer } from "./hooks/useTimer"
import { getRandomPuzzle } from "./utils/puzzles"
import { SESSION_KEY, THEME_KEY } from "./constants"

export function saveSession(puzzle, userAnswers, hiddenIndices) {
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify({
      date: new Date().toDateString(),
      puzzleId: puzzle.id,
      puzzle,
      userAnswers,
      hiddenIndices,
    }))
  } catch { /* ignorar */ }
}

function loadSession() {
  try {
    const raw  = localStorage.getItem(SESSION_KEY)
    if (!raw) return null
    const data = JSON.parse(raw)
    if (data.date !== new Date().toDateString()) return null
    return {
      puzzle:        data.puzzle,
      userAnswers:   data.userAnswers,
      hiddenIndices: data.hiddenIndices ?? null,
    }
  } catch { return null }
}

export default function App() {
  const [screen,       setScreen]       = useState("home")
  const [activePuzzle, setActivePuzzle] = useState(null)
  const [savedAnswers, setSavedAnswers] = useState(null)
  const [savedHidden,  setSavedHidden]  = useState(null)

  const [theme, setTheme] = useState(() => {
    try { return localStorage.getItem(THEME_KEY) || "dark" }
    catch { return "dark" }
  })

  const timer = useTimer(activePuzzle?.id ?? null)
  const timerRef = useRef(timer)
  timerRef.current = timer

  // Aplicar tema al body
  useEffect(() => {
    document.body.className = `theme-${theme}`
    try { localStorage.setItem(THEME_KEY, theme) } catch { /* ignorar */ }
  }, [theme])

  const startPuzzle = useCallback((puzzle) => {
    const p = puzzle ?? getRandomPuzzle(null)
    if (!p) return
    setActivePuzzle(p)
    setSavedAnswers(null)
    setSavedHidden(null)
    timerRef.current.reset()
    setScreen("game")
  }, [])

  const handleResume = useCallback(() => {
    const session = loadSession()
    if (!session) return
    setActivePuzzle(session.puzzle)
    setSavedAnswers(session.userAnswers)
    setSavedHidden(session.hiddenIndices)
    setScreen("game")
    // El useTimer arranca automáticamente al cambiar puzzleId
  }, [])

  const handleGoHome = useCallback(() => {
    timerRef.current.pause()
    setTimeout(() => setScreen("home"), 20)
  }, [])

  return (
    <div className={`app theme-${theme}`}>
      <ThemeBar theme={theme} onThemeChange={setTheme} />

      {screen === "home" && (
        <HomeScreen
          onStartDaily={startPuzzle}
          onStartNew={startPuzzle}
          onResume={handleResume}
        />
      )}

      {screen === "game" && activePuzzle && (
        <GameBoard
          puzzle={activePuzzle}
          savedAnswers={savedAnswers}
          savedHiddenIndices={savedHidden}
          timer={timer}
          onGoHome={handleGoHome}
          onStartNew={startPuzzle}
          onSaveSession={saveSession}
        />
      )}
    </div>
  )
}
