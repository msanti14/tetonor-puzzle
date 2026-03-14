import { STATS_KEY } from "../constants"

export function getStats() {
  try {
    const raw = localStorage.getItem(STATS_KEY)
    if (!raw) return getEmptyStats()
    return JSON.parse(raw)
  } catch {
    return getEmptyStats()
  }
}

export function getEmptyStats() {
  return {
    gamesPlayed: 0,
    gamesWon: 0,
    currentStreak: 0,
    maxStreak: 0,
    totalTime: 0,
    bestTime: null,
    difficultyStats: {
      1: { played: 0, won: 0 },
      2: { played: 0, won: 0 },
      3: { played: 0, won: 0 }
    }
  }
}

export function saveGameStats(puzzle, timeElapsed, won = true) {
  try {
    const stats = getStats()

    stats.gamesPlayed++
    if (won) {
      stats.gamesWon++
      stats.currentStreak++
      stats.maxStreak = Math.max(stats.maxStreak, stats.currentStreak)
      stats.totalTime += timeElapsed
      if (stats.bestTime === null || timeElapsed < stats.bestTime) {
        stats.bestTime = timeElapsed
      }
    } else {
      stats.currentStreak = 0
    }

    stats.difficultyStats[puzzle.difficulty].played++
    if (won) {
      stats.difficultyStats[puzzle.difficulty].won++
    }

    localStorage.setItem(STATS_KEY, JSON.stringify(stats))
  } catch (error) {
    console.warn("Error saving stats:", error)
  }
}

export function formatStatsTime(ms) {
  if (!ms) return "--:--"
  const total = Math.floor(ms / 1000)
  const minutes = Math.floor(total / 60)
  const seconds = total % 60
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`
}
