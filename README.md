# Tetonor Puzzle

Puzzle matemático estilo Sudoku. Encontrá los números ocultos en la fila inferior relacionándolos con los valores de la grilla mediante suma y multiplicación.

## Cómo se juega

La grilla superior muestra resultados. La fila inferior tiene números visibles y números ocultos (`?`).
Cada par de números adyacentes cumple: `a + b` y `a × b` coinciden con dos celdas de la grilla.
Tu objetivo es descubrir los valores ocultos confirmando pares correctos.

## Features

- 3 niveles de dificultad: Fácil, Normal, Difícil
- Puzzle del día + puzzles aleatorios
- Modal de confirmación de pares con validación en tiempo real
- Confetti al resolver 🎉
- Calculadora y anotador integrados en panel lateral
- Timer con pausa
- Dark mode
- Responsive (mobile + desktop)
- Sesión guardada en localStorage

## Stack

- React 18 + Vite
- canvas-confetti
- Vitest + Testing Library

## Comandos
```bash
npm install
npm run dev      # servidor de desarrollo
npm run build    # build de producción
npm run test     # tests unitarios
```

## Demo

https://msanti14.github.io/tetonor-puzzle/

---

> Proyecto anterior: [vibe-calculator](https://github.com/msanti14/vibe-calculator) — mi primera app web.
