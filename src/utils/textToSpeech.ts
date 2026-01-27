/**
 * Text-to-speech utility using ElevenLabs API.
 * Handles voice narration for the cowboy character.
 */

/**
 * Configuration for ElevenLabs API
 */
const ELEVENLABS_API_KEY = import.meta.env.VITE_ELEVENLABS_API_KEY || '';
const ELEVENLABS_VOICE_ID = import.meta.env.VITE_ELEVENLABS_VOICE_ID || 'pNInz6obpgDQGcFmaJgB'; // Default: Adam voice

/**
 * Text-to-speech service using ElevenLabs API
 */
class TextToSpeechService {
  private enabled = false;
  private currentAudio: HTMLAudioElement | null = null;
  private queue: string[] = [];
  private isPlaying = false;
  private cache: Map<string, string> = new Map();
  private maxCacheSize = 50; // Maximum number of cached audio URLs

  constructor() {
    this.enabled = !!ELEVENLABS_API_KEY;
  }

  /**
   * Check if text-to-speech is available
   */
  isAvailable(): boolean {
    return this.enabled && !!ELEVENLABS_API_KEY;
  }

  /**
   * Enable or disable text-to-speech
   */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled && !!ELEVENLABS_API_KEY;
    if (!this.enabled) {
      this.stop();
    }
  }

  /**
   * Check if text-to-speech is currently enabled
   */
  isEnabled(): boolean {
    return this.enabled;
  }

  /**
   * Stop the current speech and clear the queue
   */
  stop(): void {
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio = null;
    }
    this.queue = [];
    this.isPlaying = false;
  }

  /**
   * Generate cache key from text
   */
  private getCacheKey(text: string): string {
    // Remove whitespace and punctuation for better cache hits
    return text.toLowerCase().replace(/[^\w\s]/g, '').trim();
  }

  /**
   * Manage cache size
   */
  private manageCacheSize(): void {
    if (this.cache.size > this.maxCacheSize) {
      // Remove oldest entries (first entries in the Map)
      const keysToRemove = Array.from(this.cache.keys()).slice(0, this.cache.size - this.maxCacheSize);
      keysToRemove.forEach(key => {
        const url = this.cache.get(key);
        if (url) {
          URL.revokeObjectURL(url);
          this.cache.delete(key);
        }
      });
    }
  }

  /**
   * Synthesize speech from text using ElevenLabs API
   */
  private async synthesizeSpeech(text: string): Promise<Blob> {
    if (!ELEVENLABS_API_KEY) {
      throw new Error('ElevenLabs API key not configured');
    }

    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${ELEVENLABS_VOICE_ID}`,
      {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': ELEVENLABS_API_KEY,
        },
        body: JSON.stringify({
          text,
          model_id: 'eleven_monolingual_v1',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
          },
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`ElevenLabs API error: ${response.status} ${response.statusText}`);
    }

    return await response.blob();
  }

  /**
   * Get audio URL from cache or generate new one
   */
  private async getAudioUrl(text: string): Promise<string> {
    const cacheKey = this.getCacheKey(text);

    // Check cache first
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }

    // Generate new audio
    const audioBlob = await this.synthesizeSpeech(text);
    const audioUrl = URL.createObjectURL(audioBlob);

    // Cache the URL
    this.cache.set(cacheKey, audioUrl);
    this.manageCacheSize();

    return audioUrl;
  }

  /**
   * Process the next item in the queue
   */
  private async processQueue(): Promise<void> {
    if (this.queue.length === 0 || this.isPlaying) {
      return;
    }

    this.isPlaying = true;
    const text = this.queue.shift()!;

    try {
      const audioUrl = await this.getAudioUrl(text);

      this.currentAudio = new Audio(audioUrl);
      this.currentAudio.volume = 0.8;

      this.currentAudio.onended = () => {
        this.isPlaying = false;
        this.currentAudio = null;
        this.processQueue(); // Process next item in queue
      };

      this.currentAudio.onerror = () => {
        console.error('Error playing audio');
        this.isPlaying = false;
        this.currentAudio = null;
        this.processQueue(); // Try next item in queue
      };

      await this.currentAudio.play();
    } catch (error) {
      console.error('Error synthesizing speech:', error);
      this.isPlaying = false;
      this.currentAudio = null;
      this.processQueue(); // Try next item in queue
    }
  }

  /**
   * Speak the given text
   * If speech is already playing, the text will be queued
   */
  async speak(text: string): Promise<void> {
    if (!this.enabled || !text.trim()) {
      return;
    }

    // Clean up the text - remove markdown, emojis, and excessive whitespace
    const cleanText = text
      .replace(/[*_~`]/g, '') // Remove markdown
      .replace(/[^\w\s.,!?'-]/g, '') // Remove emojis and special chars
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();

    if (!cleanText) {
      return;
    }

    // Add to queue
    this.queue.push(cleanText);

    // Start processing if not already playing
    if (!this.isPlaying) {
      this.processQueue();
    }
  }

  /**
   * Clean up resources
   */
  cleanup(): void {
    this.stop();

    // Revoke all cached URLs
    this.cache.forEach(url => {
      URL.revokeObjectURL(url);
    });
    this.cache.clear();
  }
}

// Export singleton instance
export const textToSpeechService = new TextToSpeechService();
