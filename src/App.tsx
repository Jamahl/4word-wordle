import { useEffect, useMemo, useState, useRef, useCallback } from 'react'
import './App.css'

const WORD_LENGTH = 4
const MAX_ATTEMPTS = 6

type GameStatus = 'playing' | 'won' | 'lost'
type LetterStatus = 'correct' | 'present' | 'absent'
type ToastType = 'error' | 'success' | 'info'

interface Toast {
  id: number
  message: string
  type: ToastType
}

const WORD_LIST: string[] = [
  'CODE',
  'GAME',
  'PLAY',
  'WORD',
  'TASK',
  'CHAT',
  'NODE',
  'JAZZ',
  'QUIZ',
  'DATA',
  'NOTE',
  'PLAN',
  'TIME',
  'WORK',
  'FLOW',
  'MIND',
  'READ',
  'LOUD',
  'CITY',
  'CALM',
  'BLUE',
  'FIRE',
  'TREE',
  'STAR',
  'MOON',
  'WAVE',
  'ROCK',
  'FISH',
  'BIRD',
  'WIND',
  'RAIN',
  'SNOW',
  'DARK',
  'HOPE',
  'LOVE',
  'LIFE',
  'KING',
  'SHIP',
  'GOLD',
  'LAKE',
  'PATH',
  'DOOR',
  'BOOK',
  'SONG',
  'FAST',
  'SLOW',
  'HIGH',
  'DEEP',
  'WARM',
  'COLD',
  'JUMP',
  'PUSH',
  'PULL',
  'TURN',
  'SPIN',
  'FOLD',
  'BEND',
  'LIFT',
  'DROP',
  'GRAB',
  'HOLD',
  'STOP',
  'WAIT',
  'RUSH',
  'WALK',
  'TALK',
  'CALL',
  'TELL',
  'SHOW',
  'FIND',
  'SEEK',
  'HIDE',
  'KEEP',
  'LOSE',
  'GAIN',
  'TAKE',
  'GIVE',
  'MAKE',
  'FORM',
  'FILL',
  'OPEN',
  'SHUT',
  'LOCK',
  'SAFE',
  'RISK',
  'WILD',
  'TAME',
  'BOLD',
  'MILD',
  'SOFT',
  'HARD',
  'FIRM',
  'WEAK',
  'TINY',
  'HUGE',
  'VAST',
  'SLIM',
  'WIDE',
  'LONG',
  'TALL',
  'NEAT',
  'MESS',
  'PURE',
  'DIRT',
]

const getRandomWord = (): string => {
  const index = Math.floor(Math.random() * WORD_LIST.length)
  return WORD_LIST[index]
}

const getStatusPriority = (status: LetterStatus): number => {
  if (status === 'correct') return 3
  if (status === 'present') return 2
  return 1
}

const evaluateGuess = (guess: string, solution: string): LetterStatus[] => {
  const result: LetterStatus[] = Array(WORD_LENGTH).fill('absent')
  const solutionChars = solution.split('')
  const guessChars = guess.split('')

  const remaining: Record<string, number> = {}

  for (let i = 0; i < WORD_LENGTH; i += 1) {
    const char = solutionChars[i]
    remaining[char] = (remaining[char] || 0) + 1
  }

  for (let i = 0; i < WORD_LENGTH; i += 1) {
    if (guessChars[i] === solutionChars[i]) {
      result[i] = 'correct'
      remaining[guessChars[i]] -= 1
    }
  }

  for (let i = 0; i < WORD_LENGTH; i += 1) {
    if (result[i] === 'correct') continue

    const char = guessChars[i]
    if (remaining[char] && remaining[char] > 0) {
      result[i] = 'present'
      remaining[char] -= 1
    }
  }

  return result
}

const keyboardRows: { key: string; label: string }[][] = [
  [
    { key: 'Q', label: 'Q' },
    { key: 'W', label: 'W' },
    { key: 'E', label: 'E' },
    { key: 'R', label: 'R' },
    { key: 'T', label: 'T' },
    { key: 'Y', label: 'Y' },
    { key: 'U', label: 'U' },
    { key: 'I', label: 'I' },
    { key: 'O', label: 'O' },
    { key: 'P', label: 'P' },
  ],
  [
    { key: 'A', label: 'A' },
    { key: 'S', label: 'S' },
    { key: 'D', label: 'D' },
    { key: 'F', label: 'F' },
    { key: 'G', label: 'G' },
    { key: 'H', label: 'H' },
    { key: 'J', label: 'J' },
    { key: 'K', label: 'K' },
    { key: 'L', label: 'L' },
  ],
  [
    { key: 'BACKSPACE', label: '⌫' },
    { key: 'Z', label: 'Z' },
    { key: 'X', label: 'X' },
    { key: 'C', label: 'C' },
    { key: 'V', label: 'V' },
    { key: 'B', label: 'B' },
    { key: 'N', label: 'N' },
    { key: 'M', label: 'M' },
    { key: 'ENTER', label: 'Enter' },
  ],
]

function App() {
  const [solution, setSolution] = useState<string>(() => getRandomWord())
  const [guesses, setGuesses] = useState<string[]>([])
  const [currentGuess, setCurrentGuess] = useState('')
  const [gameStatus, setGameStatus] = useState<GameStatus>('playing')
  const [message, setMessage] = useState<string | null>(null)
  const [toasts, setToasts] = useState<Toast[]>([])
  const [shake, setShake] = useState(false)
  const [flippingRow, setFlippingRow] = useState<number | null>(null)
  const [gameId, setGameId] = useState(0)
  const toastIdRef = useRef(0)

  const showToast = useCallback((message: string, type: ToastType = 'error') => {
    const id = toastIdRef.current++
    const newToast: Toast = { id, message, type }
    setToasts((prev) => [...prev, newToast])

    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id))
    }, 2500)
  }, [])

  const handleAddLetter = useCallback((letter: string) => {
    if (gameStatus !== 'playing') return
    if (currentGuess.length >= WORD_LENGTH) return

    setCurrentGuess((prev) => `${prev}${letter}`)
  }, [gameStatus, currentGuess.length])

  const handleBackspace = useCallback(() => {
    if (gameStatus !== 'playing') return
    if (!currentGuess.length) return

    setCurrentGuess((prev) => prev.slice(0, -1))
  }, [gameStatus, currentGuess.length])

  const handleSubmitGuess = useCallback(() => {
    if (gameStatus !== 'playing') return

    const guess = currentGuess.toUpperCase()
    const currentGameId = gameId

    if (guess.length < WORD_LENGTH) {
      showToast('Not enough letters', 'error')
      setShake(true)
      setTimeout(() => setShake(false), 400)
      return
    }

    if (!WORD_LIST.includes(guess)) {
      showToast('Not in word list', 'error')
      setShake(true)
      setTimeout(() => setShake(false), 400)
      return
    }

    if (guesses.includes(guess)) {
      showToast('Already tried that word', 'error')
      setShake(true)
      setTimeout(() => setShake(false), 400)
      return
    }

    const nextGuesses = [...guesses, guess]
    const rowIndex = guesses.length
    
    setFlippingRow(rowIndex)
    setTimeout(() => {
      if (currentGameId !== gameId) return
      setFlippingRow(null)
    }, 500 * WORD_LENGTH)
    
    setGuesses(nextGuesses)
    setCurrentGuess('')
    setMessage(null)

    if (guess === solution) {
      setTimeout(() => {
        if (currentGameId !== gameId) return
        setGameStatus('won')
        showToast(
          `Excellent! Found in ${nextGuesses.length} ${nextGuesses.length === 1 ? 'try' : 'tries'}!`,
          'success',
        )
      }, 500 * WORD_LENGTH + 100)
      return
    }

    if (nextGuesses.length >= MAX_ATTEMPTS) {
      setTimeout(() => {
        if (currentGameId !== gameId) return
        setGameStatus('lost')
        showToast(`Game over! The word was ${solution}`, 'info')
      }, 500 * WORD_LENGTH + 100)
    }
  }, [gameStatus, currentGuess, gameId, guesses, solution, showToast])

  const handleVirtualKey = (key: string) => {
    if (key === 'ENTER') {
      handleSubmitGuess()
      return
    }

    if (key === 'BACKSPACE') {
      handleBackspace()
      return
    }

    if (/^[A-Z]$/.test(key)) {
      handleAddLetter(key)
    }
  }

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (gameStatus !== 'playing' && event.key !== 'Enter') {
        return
      }

      if (event.key === 'Enter') {
        if (gameStatus === 'playing') {
          handleSubmitGuess()
        }
        return
      }

      if (event.key === 'Backspace') {
        handleBackspace()
        return
      }

      if (/^[a-zA-Z]$/.test(event.key)) {
        handleAddLetter(event.key.toUpperCase())
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [gameStatus, handleAddLetter, handleBackspace, handleSubmitGuess])

  const keyboardLetterStatuses = useMemo(() => {
    const statuses: Record<string, LetterStatus> = {}

    guesses.forEach((guess) => {
      const evaluations = evaluateGuess(guess, solution)
      guess.split('').forEach((letter, index) => {
        const status = evaluations[index]
        const current = statuses[letter]

        if (!current || getStatusPriority(status) > getStatusPriority(current)) {
          statuses[letter] = status
        }
      })
    })

    return statuses
  }, [guesses, solution])

  const rows = useMemo(() => {
    const result: { letters: string[]; statuses: (LetterStatus | null)[] }[] = []

    for (let i = 0; i < MAX_ATTEMPTS; i += 1) {
      if (i < guesses.length) {
        const guess = guesses[i]
        const statuses = evaluateGuess(guess, solution)
        result.push({ letters: guess.split(''), statuses })
        continue
      }

      if (i === guesses.length && gameStatus === 'playing') {
        const letters = currentGuess.toUpperCase().split('')
        while (letters.length < WORD_LENGTH) {
          letters.push('')
        }
        result.push({ letters, statuses: Array(WORD_LENGTH).fill(null) })
        continue
      }

      result.push({ letters: Array(WORD_LENGTH).fill(''), statuses: Array(WORD_LENGTH).fill(null) })
    }

    return result
  }, [currentGuess, gameStatus, guesses, solution])

  const handleNewGame = () => {
    setGameId((prev) => prev + 1)
    setSolution(getRandomWord())
    setGuesses([])
    setCurrentGuess('')
    setGameStatus('playing')
    setMessage(null)
    setToasts([])
    setShake(false)
    setFlippingRow(null)
  }

  let statusText: string | null = message
  if (gameStatus === 'won') {
    statusText = `Nice! You found the word in ${guesses.length} ${guesses.length === 1 ? 'try' : 'tries'}.`
  } else if (gameStatus === 'lost') {
    statusText = `The word was ${solution}.`
  }

  return (
    <div className="app" aria-label="4 letter word game">
      <header className="app-header">
        <h1 className="app-title">FOUR</h1>
        <button
          type="button"
          className="new-game-button"
          onClick={handleNewGame}
          aria-label="Start a new game"
        >
          New game
        </button>
      </header>

      <main className="game" role="main">
        {gameStatus === 'playing' && (
          <div className="progress-tracker" aria-label="Progress tracker">
            <span className="progress-tracker-label">Attempts:</span>
            <span className="progress-tracker-count">
              {guesses.length}/{MAX_ATTEMPTS}
            </span>
          </div>
        )}

        <section className="game-grid" aria-label="Guesses">
          {rows.map((row, rowIndex) => {
            const isCurrentRow = rowIndex === guesses.length && gameStatus === 'playing'
            const isFlipping = flippingRow === rowIndex
            const rowClasses = `game-row ${isCurrentRow && shake ? 'shake' : ''}`
            
            return (
            <div key={`row-${rowIndex}`} className={rowClasses} aria-label={`Guess row ${rowIndex + 1}`}>
              {row.letters.map((letter, index) => {
                const status = row.statuses[index]
                const shouldFlip = isFlipping && status !== null
                const flipDelay = shouldFlip ? `${index * 0.15}s` : '0s'
                
                const classes = [
                  'tile',
                  status === 'correct' ? 'tile-correct' : '',
                  status === 'present' ? 'tile-present' : '',
                  status === 'absent' ? 'tile-absent' : '',
                  shouldFlip ? 'flip' : '',
                  status === 'correct' && !isFlipping ? 'bounce' : '',
                ]
                  .filter(Boolean)
                  .join(' ')

                return (
                  <div
                    key={`tile-${rowIndex}-${index}`}
                    className={classes}
                    style={{ animationDelay: flipDelay }}
                    aria-label={letter ? `Letter ${letter}` : 'Empty'}
                  >
                    {letter}
                  </div>
                )
              })}
            </div>
            )
          })}
        </section>

        <section className="keyboard" aria-label="Keyboard">
          {keyboardRows.map((row, rowIndex) => (
            <div key={`kb-row-${rowIndex}`} className="keyboard-row">
              {row.map(({ key, label }) => {
                const status = keyboardLetterStatuses[key]
                const classes = [
                  'key',
                  status === 'correct' ? 'key-correct' : '',
                  status === 'present' ? 'key-present' : '',
                  status === 'absent' ? 'key-absent' : '',
                ]
                  .filter(Boolean)
                  .join(' ')

                const ariaLabel =
                  key === 'ENTER' ? 'Submit guess' : key === 'BACKSPACE' ? 'Delete last letter' : `Letter ${label}`

                return (
                  <button
                    key={key}
                    type="button"
                    className={classes}
                    onClick={() => handleVirtualKey(key)}
                    aria-label={ariaLabel}
                  >
                    {label}
                  </button>
                )
              })}
            </div>
          ))}
        </section>

        {statusText && (
          <div className="status-message" aria-live="polite">
            {statusText}
          </div>
        )}
      </main>

      {toasts.length > 0 && (
        <div className="toast-container" aria-live="assertive" aria-atomic="true">
          {toasts.map((toast) => (
            <div
              key={toast.id}
              className={`toast ${toast.type === 'success' ? 'toast-success' : toast.type === 'info' ? 'toast-info' : ''}`}
            >
              {toast.message}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default App
