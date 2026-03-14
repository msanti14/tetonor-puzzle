import { describe, it, expect } from 'vitest'
import {
  isPairValid,
  computeCellStates,
  areAllBottomNumbersUsed,
  isPuzzleSolved,
} from './puzzleValidator.js'

describe('isPairValid', () => {
  const topGrid = [8, 15, 7, 20, 12, 21, 9, 18, 6, 24, 10, 30, 14, 35, 16, 40]

  it('returns true when both sum and product exist in topGrid', () => {
    expect(isPairValid(3, 5, topGrid)).toBe(true)
  })

  it('returns false when only sum exists', () => {
    const limitedGrid = [8]
    expect(isPairValid(3, 5, limitedGrid)).toBe(false)
  })

  it('returns false when only product exists', () => {
    const limitedGrid = [15]
    expect(isPairValid(3, 5, limitedGrid)).toBe(false)
  })

  it('returns false when neither exists', () => {
    expect(isPairValid(1, 1, topGrid)).toBe(false)
  })
})

describe('computeCellStates', () => {
  const topGrid = [8, 15, 7, 20]

  it('returns neutral for empty pairs', () => {
    const result = computeCellStates([], topGrid)
    expect(result).toHaveLength(4)
    result.forEach((cell) => {
      expect(cell.status).toBe('neutral')
      expect(cell.labels).toHaveLength(0)
    })
  })

  it('marks cell as green when explained by sum only', () => {
    const pairs = [{ a: 3, b: 5 }]
    const result = computeCellStates(pairs, topGrid)
    expect(result[0].status).toBe('green')
    expect(result[0].labels).toContain('3+5')
  })

  it('marks cell as green when explained by product only', () => {
    const pairs = [{ a: 3, b: 5 }]
    const result = computeCellStates(pairs, topGrid)
    expect(result[1].status).toBe('green')
    expect(result[1].labels).toContain('3×5')
  })

  it('marks cell as green-full when same pair provides both sum and product', () => {
    const pairs = [{ a: 2, b: 2 }]
    const topGridWithSelf = [4]
    const result = computeCellStates(pairs, topGridWithSelf)
    expect(result[0].status).toBe('green-full')
  })
})

describe('areAllBottomNumbersUsed', () => {
  const bottomNumbers = [3, 5, 2, 4]
  const hiddenIndices = [1, 3]

  it('returns true when 80% of visible numbers are used', () => {
    const pairs = [
      { a: 3, b: 5 },
      { a: 2, b: 4 },
    ]
    expect(areAllBottomNumbersUsed(pairs, bottomNumbers, hiddenIndices)).toBe(true)
  })

  it('returns false when less than 80% are used', () => {
    const pairs = [{ a: 3, b: 5 }]
    expect(areAllBottomNumbersUsed(pairs, bottomNumbers, hiddenIndices)).toBe(false)
  })

  it('treats hidden indices as not required', () => {
    const pairs = [{ a: 3, b: 5 }]
    const hidden = [0, 1, 2, 3]
    expect(areAllBottomNumbersUsed(pairs, bottomNumbers, hidden)).toBe(true)
  })
})

describe('isPuzzleSolved', () => {
  const topGrid = [8, 15, 7, 20]
  const bottomNumbers = [3, 5, 2, 4]
  const hiddenIndices = [1, 3]

  it('returns true when puzzle is fully solved', () => {
    const pairs = [
      { a: 2, b: 2 },
      { a: 3, b: 5 },
    ]
    const cellStates = [
      { status: 'green-full' },
      { status: 'green-full' },
      { status: 'green-full' },
      { status: 'green-full' },
    ]
    expect(isPuzzleSolved(cellStates, pairs, bottomNumbers, hiddenIndices)).toBe(true)
  })

  it('returns false when cells are not all green-full', () => {
    const pairs = [{ a: 3, b: 5 }]
    const cellStates = [
      { status: 'green' },
      { status: 'green' },
      { status: 'neutral' },
      { status: 'neutral' },
    ]
    expect(isPuzzleSolved(cellStates, pairs, bottomNumbers, hiddenIndices)).toBe(false)
  })

  it('returns false when not enough bottom numbers are used', () => {
    const pairs = [{ a: 3, b: 5 }]
    const cellStates = [
      { status: 'green-full' },
      { status: 'green-full' },
      { status: 'green-full' },
      { status: 'green-full' },
    ]
    expect(isPuzzleSolved(cellStates, pairs, bottomNumbers, hiddenIndices)).toBe(false)
  })
})
