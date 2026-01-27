import { useState, useEffect } from 'react'
import { audioService } from '../utils/audio'

interface SoundToggleProps {
  gameStarted: boolean
}

export function SoundToggle({ gameStarted: _gameStarted }: SoundToggleProps) {
  const [isEnabled, setIsEnabled] = useState(true)

  // Update audio service when toggle changes
  useEffect(() => {
    audioService.setEnabled(isEnabled)
  }, [isEnabled])

  const toggleSound = () => {
    setIsEnabled(!isEnabled)
  }

  return (
    <button
      onClick={toggleSound}
      className="fixed top-4 left-20 z-50 w-12 h-12 rounded-full flex items-center justify-center transition-all hover:scale-110 active:scale-95 shadow-lg border-2"
      style={{
        background: 'linear-gradient(135deg, rgba(62, 39, 35, 0.9) 0%, rgba(78, 52, 46, 0.9) 100%)',
        borderColor: 'rgba(218, 165, 32, 0.6)',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.4)',
      }}
      aria-label={isEnabled ? 'Mute sound effects' : 'Unmute sound effects'}
      title={isEnabled ? 'Mute sound effects' : 'Unmute sound effects'}
    >
      {isEnabled ? (
        // Sound effects on icon (bell)
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-6 h-6 text-gold-400"
        >
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
      ) : (
        // Sound effects off icon (bell with slash)
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-6 h-6 text-gold-400/60"
        >
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          <line x1="1" y1="1" x2="23" y2="23" />
        </svg>
      )}
    </button>
  )
}
