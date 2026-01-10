import { useRef, useState, useEffect } from 'react'

interface MusicPlayerProps {
  gameStarted: boolean
}

export function MusicPlayer({ gameStarted }: MusicPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [hasAutoStarted, setHasAutoStarted] = useState(false)

  // Auto-start music when game starts
  useEffect(() => {
    if (gameStarted && !hasAutoStarted && audioRef.current) {
      // Attempt to play - this should work since user clicked "Start Tutorial"
      audioRef.current.play()
        .then(() => {
          setIsPlaying(true)
          setHasAutoStarted(true)
        })
        .catch((err) => {
          // Browser blocked autoplay - user will need to click the button
          console.log('Autoplay blocked:', err)
          setHasAutoStarted(true) // Don't retry
        })
    }
  }, [gameStarted, hasAutoStarted])

  const togglePlay = () => {
    if (!audioRef.current) return

    if (isPlaying) {
      audioRef.current.pause()
      setIsPlaying(false)
    } else {
      audioRef.current.play()
        .then(() => setIsPlaying(true))
        .catch((err) => console.log('Play failed:', err))
    }
  }

  return (
    <>
      <audio
        ref={audioRef}
        src="/audio/background-music.mp3"
        loop
        preload="auto"
      />
      <button
        onClick={togglePlay}
        className="fixed top-4 left-4 z-50 w-12 h-12 rounded-full flex items-center justify-center transition-all hover:scale-110 active:scale-95 shadow-lg border-2"
        style={{
          background: 'linear-gradient(135deg, rgba(62, 39, 35, 0.9) 0%, rgba(78, 52, 46, 0.9) 100%)',
          borderColor: 'rgba(218, 165, 32, 0.6)',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.4)',
        }}
        aria-label={isPlaying ? 'Pause music' : 'Play music'}
        title={isPlaying ? 'Pause music' : 'Play music'}
      >
        {isPlaying ? (
          // Speaker with sound waves icon
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
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
            <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
            <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
          </svg>
        ) : (
          // Muted speaker icon
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
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
            <line x1="23" y1="9" x2="17" y2="15" />
            <line x1="17" y1="9" x2="23" y2="15" />
          </svg>
        )}
      </button>
    </>
  )
}
