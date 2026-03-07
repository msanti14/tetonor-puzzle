// =============================================
// TETONOR - Barra de tema + reloj (fija, esquina superior derecha)
// src/components/ThemeBar.jsx
// =============================================

import React, { useState, useEffect } from "react"

const DAYS = ["domingo","lunes","martes","miércoles","jueves","viernes","sábado"]

function useClock() {
  const [now, setNow] = useState(new Date())
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])
  return now
}

const THEME_OPTIONS = [
  { value: "light", icon: "☀️" },
  { value: "dark",  icon: "🌙" },
  { value: "party", icon: "🎉" },
]

export default function ThemeBar({ theme, onThemeChange }) {
  const now  = useClock()
  const day  = DAYS[now.getDay()]
  const dd   = String(now.getDate()).padStart(2, "0")
  const mm   = String(now.getMonth() + 1).padStart(2, "0")
  const yyyy = now.getFullYear()
  const hh   = String(now.getHours()).padStart(2, "0")
  const min  = String(now.getMinutes()).padStart(2, "0")

  return (
    <div className="theme-bar">
      <div className="theme-bar__clock">
        <span className="theme-bar__date">{day} {dd}/{mm}/{yyyy}</span>
        <span className="theme-bar__time">{hh}:{min} hs</span>
      </div>
      <div className="theme-bar__divider" />
      <div className="theme-bar__toggles">
        {THEME_OPTIONS.map(opt => (
          <button
            key={opt.value}
            className={`theme-btn ${theme === opt.value ? "active" : ""}`}
            onClick={() => onThemeChange(opt.value)}
            title={opt.value}
          >
            {opt.icon}
          </button>
        ))}
      </div>
    </div>
  )
}
