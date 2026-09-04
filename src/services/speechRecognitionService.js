/**
 * MediKiosk Web Speech Recognition Service
 *
 * Utilizes the browser-native SpeechRecognition / webkitSpeechRecognition API.
 * In Chrome, Chromium, and Android WebViews, this uses Google's Cloud Speech
 * recognition engine natively with ZERO external API keys and ZERO quota cost.
 */

export const SUPPORTED_LANGUAGES = [
  { code: 'en-IN', label: 'English (India)', native: 'English' },
  { code: 'hi-IN', label: 'Hindi (हिंदी)', native: 'हिंदी' },
  { code: 'en-US', label: 'English (US)', native: 'English (US)' },
]

export function isSpeechRecognitionSupported() {
  if (typeof window === 'undefined') return false
  return Boolean(window.SpeechRecognition || window.webkitSpeechRecognition)
}

class SpeechRecognitionManager {
  constructor() {
    this.recognition = null
    this.isListening = false
    this.currentLang = 'en-IN'
    this.callbacks = {}
    this.init()
  }

  init() {
    if (!isSpeechRecognitionSupported()) return

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    this.recognition = new SpeechRecognition()
    this.recognition.continuous = true
    this.recognition.interimResults = true
    this.recognition.maxAlternatives = 1
    this.recognition.lang = this.currentLang

    this.recognition.onstart = () => {
      this.isListening = true
      if (this.callbacks.onStart) this.callbacks.onStart()
    }

    this.recognition.onresult = (event) => {
      let interimTranscript = ''
      let finalTranscript = ''

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const transcript = event.results[i][0].transcript
        if (event.results[i].isFinal) {
          finalTranscript += transcript
        } else {
          interimTranscript += transcript
        }
      }

      if (interimTranscript && this.callbacks.onInterimResult) {
        this.callbacks.onInterimResult(interimTranscript.trim())
      }

      if (finalTranscript && this.callbacks.onFinalResult) {
        this.callbacks.onFinalResult(finalTranscript.trim())
      }
    }

    this.recognition.onerror = (event) => {
      // 'no-speech' is a common benign event when the user pauses
      if (event.error === 'no-speech') {
        return
      }

      console.warn('[SpeechRecognition] Error encountered:', event.error)
      if (this.callbacks.onError) {
        let userMessage = 'Microphone error: ' + event.error
        if (event.error === 'not-allowed') {
          userMessage = 'Microphone permission denied. Please allow microphone access in browser settings.'
        } else if (event.error === 'network') {
          userMessage = 'Network error during speech recognition. Please check your internet connection.'
        }
        this.callbacks.onError({ error: event.error, message: userMessage })
      }
    }

    this.recognition.onend = () => {
      this.isListening = false
      if (this.callbacks.onEnd) this.callbacks.onEnd()
    }
  }

  setLanguage(langCode) {
    this.currentLang = langCode
    if (this.recognition) {
      this.recognition.lang = langCode
    }
  }

  start({ lang, onInterimResult, onFinalResult, onError, onStart, onEnd } = {}) {
    if (!isSpeechRecognitionSupported()) {
      if (onError) {
        onError({
          error: 'unsupported',
          message: 'Speech recognition is not supported in this browser. Please use Google Chrome or Edge.'
        })
      }
      return false
    }

    if (this.isListening) {
      this.stop()
    }

    if (lang) {
      this.setLanguage(lang)
    }

    this.callbacks = {
      onInterimResult,
      onFinalResult,
      onError,
      onStart,
      onEnd
    }

    try {
      this.recognition.start()
      return true
    } catch (err) {
      console.warn('[SpeechRecognition] Start error:', err)
      if (onError) onError({ error: 'start_failed', message: err.message })
      return false
    }
  }

  stop() {
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop()
      } catch (err) {
        // ignore already stopped errors
      }
    }
    this.isListening = false
  }

  abort() {
    if (this.recognition && this.isListening) {
      try {
        this.recognition.abort()
      } catch (err) {
        // ignore
      }
    }
    this.isListening = false
  }
}

export const speechRecognizer = new SpeechRecognitionManager()
