// =============================================
// TETONOR - Componente Raíz
// src/App.jsx
// =============================================

import React, { useState, useEffect } from "react"
import HomeScreen from "./components/HomeScreen"
import GameBoard from "./components/GameBoard"
import { useTimer } from "./hooks/useTimer"

const SESSION_KEY = "tetonor_session"
const THEME_KEY   = "tetonor_theme"

// ── Utilidades de sesión ─────────────────────────────────────────────────────

export function saveSession(puzzle, userAnswers, hiddenIndices) {
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify({
      date:         new Date().toDateString(),
      puzzleId:     puzzle.id,
      puzzle,
      userAnswers,
      hiddenIndices,
    }))
  } catch { /* ignorar */ }
}

function loadSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY)
    if (!raw) return null
    const data = JSON.parse(raw)
    if (data.date !== new Date().toDateString()) return null
    return {
      puzzle:        data.puzzle,
      userAnswers:   data.userAnswers,
      hiddenIndices: data.hiddenIndices ?? null,
    }
  } catch {
    return null
  }
}

// ── Componente ───────────────────────────────────────────────────────────────

export default function App() {

  const [screen, setScreen]               = useState("home")
  const [activePuzzle, setActivePuzzle]   = useState(null)
  const [savedAnswers, setSavedAnswers]   = useState(null)
  const [savedHidden, setSavedHidden]     = useState(null)

  const [theme, setTheme] = useState(() => {
    try { return localStorage.getItem(THEME_KEY) || "dark" }
    catch { return "dark" }
  })

  // Timer vive aquí — nunca se desmonta
  const timer = useTimer(activePuzzle?.id ?? null)

  // Aplicar tema al body
  useEffect(() => {
    document.body.className = `theme-${theme}`
    try { localStorage.setItem(THEME_KEY, theme) }
    catch { /* ignorar */ }
  }, [theme])

  // ── Handlers ────────────────────────────────────────────────────────────────

  function handleStartDaily(puzzle) {
    setActivePuzzle(puzzle)
    setSavedAnswers(null)
    setSavedHidden(null)
    timer.reset()
    setScreen("game")
  }

  function handleStartNew(puzzle) {
    setActivePuzzle(puzzle)
    setSavedAnswers(null)
    setSavedHidden(null)
    timer.reset()
    setScreen("game")
  }

  function handleResume() {
    const session = loadSession()
    if (!session) return
    console.log("handleResume - storage:", localStorage.getItem("tetonor_timer"))
    setActivePuzzle(session.puzzle)
    setSavedAnswers(session.userAnswers)
    setSavedHidden(session.hiddenIndices)
    setScreen("game")
    setTimeout(() => {
      console.log("handleResume - después del timeout, storage:", localStorage.getItem("tetonor_timer"))
      timer.resume()
    }, 50)
  }
  
  

  function handleGoHome() {
    timer.pause()  // pause guarda en storage
    // Esperar un tick para que el storage se escriba antes de desmontar GameBoard
    setTimeout(() => setScreen("home"), 20)
  }
  
  

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <div className={`app theme-${theme}`}>
      {screen === "home" && (
        <HomeScreen
          onStartDaily={handleStartDaily}
          onStartNew={handleStartNew}
          onResume={handleResume}
          theme={theme}
          onThemeChange={setTheme}
        />
      )}

      {screen === "game" && activePuzzle && (
        <GameBoard
          puzzle={activePuzzle}
          savedAnswers={savedAnswers}
          savedHiddenIndices={savedHidden}
          timer={timer}
          theme={theme}
          onThemeChange={setTheme}
          onGoHome={handleGoHome}
          onStartNew={handleStartNew}
          onSaveSession={saveSession}
        />
      )}
    </div>
  )
}
