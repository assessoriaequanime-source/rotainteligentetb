import { useCallback, useEffect, useRef, useState } from "react";

interface SpeakOptions {
  /** Cancela falas anteriores e fala imediatamente */
  priority?: boolean;
  /** Velocidade da fala (0.5 - 2). Default 0.92 (didática) */
  rate?: number;
  /** Callback ao terminar a fala */
  onEnd?: () => void;
}

/**
 * Hook de TTS otimizado para orientação de motorista:
 *  - Rate ligeiramente reduzido para clareza
 *  - Fila simples (priority cancela)
 *  - Seleção automática de voz pt-BR
 *  - Estimativa de duração para sincronizar etapas
 */
export function useSpeech() {
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const voiceRef = useRef<SpeechSynthesisVoice | null>(null);
  const currentRef = useRef<SpeechSynthesisUtterance | null>(null);
  const [speaking, setSpeaking] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    synthRef.current = window.speechSynthesis;

    function pickVoice() {
      const voices = synthRef.current?.getVoices() ?? [];
      // Prefere vozes pt-BR femininas naturais
      const preferred =
        voices.find((v) => /pt[-_]BR/i.test(v.lang) && /female|google|microsoft/i.test(v.name)) ||
        voices.find((v) => /pt[-_]BR/i.test(v.lang)) ||
        voices.find((v) => v.lang.toLowerCase().startsWith("pt")) ||
        null;
      voiceRef.current = preferred;
    }
    pickVoice();
    synthRef.current.onvoiceschanged = pickVoice;
    return () => {
      if (synthRef.current) synthRef.current.onvoiceschanged = null;
    };
  }, []);

  const speak = useCallback((text: string, opts?: SpeakOptions) => {
    const synth = synthRef.current;
    if (!synth || !text) {
      opts?.onEnd?.();
      return;
    }
    if (opts?.priority) synth.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "pt-BR";
    if (voiceRef.current) u.voice = voiceRef.current;
    u.rate = opts?.rate ?? 0.92; // mais devagar, didático
    u.pitch = 1;
    u.volume = 1;
    u.onstart = () => setSpeaking(true);
    u.onend = () => {
      setSpeaking(false);
      currentRef.current = null;
      opts?.onEnd?.();
    };
    u.onerror = () => {
      setSpeaking(false);
      currentRef.current = null;
      opts?.onEnd?.();
    };
    currentRef.current = u;
    synth.speak(u);
  }, []);

  const stop = useCallback(() => {
    synthRef.current?.cancel();
    setSpeaking(false);
    currentRef.current = null;
  }, []);

  return { speak, stop, speaking };
}

/**
 * Estima duração de fala em ms a partir do texto.
 * ~14 caracteres/segundo em rate 0.92 (pt-BR).
 */
export function estimateSpeechDurationMs(text: string, rate = 0.92): number {
  const baseCharsPerSec = 14 * rate;
  const seconds = Math.max(2.5, text.length / baseCharsPerSec);
  return Math.round(seconds * 1000);
}
