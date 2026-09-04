/**
 * MediKiosk Web Speech Synthesis Service
 *
 * Utilizes the browser-native window.speechSynthesis API to provide
 * spoken audio feedback for kiosk patients (hands-free live voice experience).
 * 100% Free, zero cloud API quota, and zero network latency.
 */

export function isSpeechSynthesisSupported() {
  return typeof window !== 'undefined' && 'speechSynthesis' in window
}

class SpeechSynthesisManager {
  constructor() {
    this.synth = typeof window !== 'undefined' ? window.speechSynthesis : null
    this.voices = []
    this.isSpeaking = false
    this.initVoices()
  }

  initVoices() {
    if (!this.synth) return

    const updateVoices = () => {
      this.voices = this.synth.getVoices()
    }

    updateVoices()
    if (this.synth.onvoiceschanged !== undefined) {
      this.synth.onvoiceschanged = updateVoices
    }
  }

  getBestVoice(lang = 'en-IN') {
    if (!this.voices || this.voices.length === 0) {
      if (this.synth) this.voices = this.synth.getVoices()
    }

    const langPrefix = lang.split('-')[0].toLowerCase()

    // 1. Exact match (e.g. en-IN or hi-IN)
    let match = this.voices.find(v => v.lang.toLowerCase() === lang.toLowerCase())
    if (match) return match

    // 2. Prefix match (e.g. any 'hi' voice or any 'en' voice)
    match = this.voices.find(v => v.lang.toLowerCase().startsWith(langPrefix))
    if (match) return match

    // 3. Fallback to default
    return this.voices.find(v => v.default) || this.voices[0] || null
  }

  speak(text, { lang = 'en-IN', rate = 1.0, pitch = 1.0, onEnd, onError } = {}) {
    if (!this.synth || !text) return

    // Stop any ongoing speech
    this.stop()

    // Clean text of markdown or special characters before speaking
    const cleanText = text
      .replace(/[*_#`~]/g, '')
      .replace(/\[.*?\]\(.*?\)/g, '')
      .trim()

    if (!cleanText) return

    const utterance = new SpeechSynthesisUtterance(cleanText)
    utterance.lang = lang
    utterance.rate = rate
    utterance.pitch = pitch

    const selectedVoice = this.getBestVoice(lang)
    if (selectedVoice) {
      utterance.voice = selectedVoice
    }

    utterance.onstart = () => {
      this.isSpeaking = true
    }

    utterance.onend = () => {
      this.isSpeaking = false
      if (onEnd) onEnd()
    }

    utterance.onerror = (err) => {
      this.isSpeaking = false
      console.warn('[SpeechSynthesis] Error:', err)
      if (onError) onError(err)
    }

    try {
      this.synth.speak(utterance)
    } catch (e) {
      console.warn('[SpeechSynthesis] Exception calling speak:', e)
    }
  }

  stop() {
    if (this.synth) {
      try {
        this.synth.cancel()
      } catch (e) {
        // ignore
      }
      this.isSpeaking = false
    }
  }
}

export const speechSynthesizer = new SpeechSynthesisManager()
