// =============================================
// TETONOR - Hook del Cronómetro
// src/hooks/useTimer.js
// =============================================

import { useState, useEffect, useRef } from "react"

const STORAGE_KEY = "tetonor_timer"

export function useTimer(puzzleId) {
  const [elapsed, setElapsed]   = useState(0)
  const [isRunning, setIsRunning] = useState(false)

  const baseRef      = useRef(0)   // tiempo acumulado antes del intervalo actual
  const startRef     = useRef(null) // timestamp de cuando arrancó el intervalo
  const intervalRef  = useRef(null)
  const puzzleIdRef  = useRef(puzzleId) // para acceder en closures

  // ── Helpers internos ──────────────────────────────────────────────────────

  function stopInterval() {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }

  function saveStorage(ms) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        puzzleId: puzzleIdRef.current,
        elapsed: ms,
      }))
    } catch { /* ignorar */ }
  }

  function loadStorage(id) {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (!raw) return 0
      const data = JSON.parse(raw)
      return data.puzzleId === id ? (data.elapsed || 0) : 0
    } catch { return 0 }
  }

  // ── API pública ────────────────────────────────────────────────────────────

  function pause() {
    if (!startRef.current) return
    const total = baseRef.current + (Date.now() - startRef.current)
    stopInterval()
    baseRef.current  = total
    startRef.current = null
    setElapsed(total)
    setIsRunning(false)
    saveStorage(total)
  }

  
  function resume() {
    console.log("resume - baseRef:", baseRef.current, "startRef:", startRef.current)
    if (startRef.current) return
    startRef.current = Date.now()
    setIsRunning(true)
    intervalRef.current = setInterval(() => {
      setElapsed(baseRef.current + (Date.now() - startRef.current))
    }, 1000)
  }
  

  function reset() {
    stopInterval()
    baseRef.current  = 0
    startRef.current = null
    setElapsed(0)
    setIsRunning(false)
    try { localStorage.removeItem(STORAGE_KEY) } catch { /* ignorar */ }
  }

  // ── Cuando cambia el puzzleId ──────────────────────────────────────────────

  useEffect(() => {
    puzzleIdRef.current = puzzleId
    if (puzzleId === null) return

    stopInterval()
    const saved = loadStorage(puzzleId)
    baseRef.current  = saved
    startRef.current = Date.now()
    setElapsed(saved)
    setIsRunning(true)

    intervalRef.current = setInterval(() => {
      setElapsed(baseRef.current + (Date.now() - startRef.current))
    }, 1000)

    return () => stopInterval()
  }, [puzzleId])

  // ── Page Visibility ────────────────────────────────────────────────────────

  useEffect(() => {
    function handleVisibility() {
      if (document.hidden) pause()
      else if (puzzleIdRef.current) resume()
    }
    document.addEventListener("visibilitychange", handleVisibility)
    return () => document.removeEventListener("visibilitychange", handleVisibility)
  }, [])

  // ── beforeunload ───────────────────────────────────────────────────────────

  useEffect(() => {
    function handleUnload() {
      if (!startRef.current) return
      saveStorage(baseRef.current + (Date.now() - startRef.current))
    }
    window.addEventListener("beforeunload", handleUnload)
    return () => window.removeEventListener("beforeunload", handleUnload)
  }, [])

  return {
    elapsed,
    isRunning,
    pause,
    resume,
    reset,
    formatted: formatTime(elapsed),
  }
}

export function formatTime(ms) {
  const total   = Math.floor(ms / 1000)
  const minutes = Math.floor(total / 60)
  const seconds = total % 60
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`
}
