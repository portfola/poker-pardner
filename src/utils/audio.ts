/**
 * Audio utility for managing sound effects in the poker game.
 * Handles loading, caching, and playing sound effects for game events.
 */

import { logger } from './logger'

/**
 * Available sound effect types
 */
export type SoundEffect = 'deal' | 'bet' | 'fold' | 'win' | 'ambiance'

/**
 * Configuration for each sound effect
 */
interface SoundConfig {
  path: string
  volume: number
  loop?: boolean
}

/**
 * Sound effect configurations
 */
const SOUND_CONFIGS: Record<SoundEffect, SoundConfig> = {
  deal: {
    path: '/audio/deal.mp3',
    volume: 0.6,
  },
  bet: {
    path: '/audio/bet.mp3',
    volume: 0.5,
  },
  fold: {
    path: '/audio/fold.mp3',
    volume: 0.5,
  },
  win: {
    path: '/audio/win.mp3',
    volume: 0.7,
  },
  ambiance: {
    path: '/audio/ambiance.mp3',
    volume: 0.3,
    loop: true,
  },
}

/**
 * Audio service for managing sound effects
 */
class AudioService {
  private enabled = true
  private audioCache: Map<SoundEffect, HTMLAudioElement> = new Map()
  private currentAmbiance: HTMLAudioElement | null = null
  private preloadComplete = false

  /**
   * Enable or disable sound effects
   */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled
    if (!enabled) {
      this.stopAll()
    }
  }

  /**
   * Check if sound effects are currently enabled
   */
  isEnabled(): boolean {
    return this.enabled
  }

  /**
   * Preload all sound effects
   * Should be called during app initialization to avoid delays during gameplay
   */
  async preload(): Promise<void> {
    if (this.preloadComplete) {
      return
    }

    logger.log('[Audio] Preloading sound effects...')

    const loadPromises = Object.entries(SOUND_CONFIGS).map(
      ([soundEffect, config]) => {
        return new Promise<void>((resolve) => {
          const audio = new Audio()
          audio.src = config.path
          audio.volume = config.volume
          audio.preload = 'auto'

          if (config.loop) {
            audio.loop = true
          }

          // Store in cache immediately
          this.audioCache.set(soundEffect as SoundEffect, audio)

          // Resolve when loaded or on error (don't block on missing files)
          audio.addEventListener('canplaythrough', () => {
            logger.debug(`[Audio] Loaded: ${soundEffect}`)
            resolve()
          })

          audio.addEventListener('error', (e) => {
            logger.warn(`[Audio] Failed to load ${soundEffect}:`, e)
            resolve() // Resolve anyway to not block other sounds
          })

          // Fallback timeout
          setTimeout(() => {
            logger.warn(`[Audio] Timeout loading ${soundEffect}`)
            resolve()
          }, 5000)
        })
      }
    )

    await Promise.all(loadPromises)
    this.preloadComplete = true
    logger.log('[Audio] Preload complete')
  }

  /**
   * Get or create audio element for a sound effect
   */
  private getAudio(soundEffect: SoundEffect): HTMLAudioElement | null {
    // Check cache first
    if (this.audioCache.has(soundEffect)) {
      return this.audioCache.get(soundEffect)!
    }

    // Create new audio element if not cached
    const config = SOUND_CONFIGS[soundEffect]
    if (!config) {
      logger.warn(`[Audio] Unknown sound effect: ${soundEffect}`)
      return null
    }

    const audio = new Audio()
    audio.src = config.path
    audio.volume = config.volume

    if (config.loop) {
      audio.loop = true
    }

    this.audioCache.set(soundEffect, audio)
    return audio
  }

  /**
   * Play a sound effect
   * @param soundEffect - The sound effect to play
   * @param options - Optional configuration
   * @param options.volume - Override the default volume (0-1)
   * @param options.restart - If true, restart the sound from the beginning even if already playing
   */
  play(
    soundEffect: SoundEffect,
    options?: { volume?: number; restart?: boolean }
  ): void {
    if (!this.enabled) {
      return
    }

    // Handle ambiance separately (singleton instance)
    if (soundEffect === 'ambiance') {
      this.playAmbiance(options?.volume)
      return
    }

    const audio = this.getAudio(soundEffect)
    if (!audio) {
      return
    }

    // Create a clone for non-looping sounds to allow overlapping playback
    const playableAudio = audio.cloneNode() as HTMLAudioElement
    playableAudio.volume = options?.volume ?? audio.volume

    // Restart if requested
    if (options?.restart) {
      playableAudio.currentTime = 0
    }

    playableAudio
      .play()
      .catch((err) => logger.debug(`[Audio] Play failed for ${soundEffect}:`, err))
  }

  /**
   * Play ambiance sound (background loop)
   * Only one instance of ambiance can play at a time
   */
  private playAmbiance(volume?: number): void {
    if (this.currentAmbiance) {
      // Already playing
      if (volume !== undefined) {
        this.currentAmbiance.volume = volume
      }
      return
    }

    const audio = this.getAudio('ambiance')
    if (!audio) {
      return
    }

    if (volume !== undefined) {
      audio.volume = volume
    }

    this.currentAmbiance = audio
    audio
      .play()
      .catch((err) => {
        logger.debug('[Audio] Ambiance play failed:', err)
        this.currentAmbiance = null
      })
  }

  /**
   * Stop a specific sound effect
   */
  stop(soundEffect: SoundEffect): void {
    if (soundEffect === 'ambiance' && this.currentAmbiance) {
      this.currentAmbiance.pause()
      this.currentAmbiance.currentTime = 0
      this.currentAmbiance = null
      return
    }

    const audio = this.audioCache.get(soundEffect)
    if (audio) {
      audio.pause()
      audio.currentTime = 0
    }
  }

  /**
   * Stop all currently playing sounds
   */
  stopAll(): void {
    // Stop ambiance
    if (this.currentAmbiance) {
      this.currentAmbiance.pause()
      this.currentAmbiance.currentTime = 0
      this.currentAmbiance = null
    }

    // Stop all cached audio
    this.audioCache.forEach((audio) => {
      audio.pause()
      audio.currentTime = 0
    })
  }

  /**
   * Set volume for a specific sound effect
   * @param soundEffect - The sound effect to adjust
   * @param volume - Volume level (0-1)
   */
  setVolume(soundEffect: SoundEffect, volume: number): void {
    const clampedVolume = Math.max(0, Math.min(1, volume))

    if (soundEffect === 'ambiance' && this.currentAmbiance) {
      this.currentAmbiance.volume = clampedVolume
    }

    const audio = this.audioCache.get(soundEffect)
    if (audio) {
      audio.volume = clampedVolume
    }
  }

  /**
   * Set master volume for all sound effects
   * @param volume - Volume level (0-1)
   */
  setMasterVolume(volume: number): void {
    const clampedVolume = Math.max(0, Math.min(1, volume))

    this.audioCache.forEach((audio, soundEffect) => {
      const config = SOUND_CONFIGS[soundEffect]
      audio.volume = config.volume * clampedVolume
    })

    if (this.currentAmbiance) {
      const config = SOUND_CONFIGS.ambiance
      this.currentAmbiance.volume = config.volume * clampedVolume
    }
  }

  /**
   * Clean up resources
   * Should be called when the app is unmounted
   */
  cleanup(): void {
    this.stopAll()
    this.audioCache.clear()
    this.currentAmbiance = null
    this.preloadComplete = false
  }
}

// Export singleton instance
export const audioService = new AudioService()
