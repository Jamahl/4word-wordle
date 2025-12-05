# 4word Wordle

A modern, minimal 4-letter word game inspired by Wordle. Guess the hidden 4-letter word in up to 6 tries, with colourful feedback tiles, smooth animations, and both on-screen and physical keyboard input.

## What this project is

- **4-letter Wordle-style game** with 6 attempts per round.
- Visual feedback:
  - Green = correct letter in the correct position.
  - Yellow = letter is in the word but in a different position.
  - Grey = letter is not in the word.
- On-screen keyboard plus full physical keyboard support.
- Toast notifications, subtle animations, and a clean dark UI.

## Tech stack

- **React** (with hooks) + **TypeScript**
- **Vite** for fast dev server and builds
- **Modern CSS** (custom, no CSS frameworks)
- Configured **ESLint** for a better developer experience

## Getting started

### Prerequisites

- Node.js (v18+ recommended)
- npm (comes with Node)

### Install dependencies

```bash
npm install
```

### Run the development server

```bash
npm run dev
```

Then open the URL printed in the terminal, typically:

```text
http://localhost:5173/
```

### Build for production

```bash
npm run build
```

### Preview the production build locally

```bash
npm run preview
```

This starts a local server serving the built assets so you can test the production build.

