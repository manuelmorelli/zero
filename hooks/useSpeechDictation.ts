"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";

// Solo la parte della Web Speech API che usiamo: TypeScript non la conosce in tutti i browser
// (Chrome/Edge/Safari la espongono anche come "webkit...", Firefox per ora no).
type RecognitionResultList = ArrayLike<ArrayLike<{ transcript: string }>>;

type Recognition = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((event: { results: RecognitionResultList }) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
};

type RecognitionConstructor = new () => Recognition;

function getRecognitionConstructor(): RecognitionConstructor | null {
  const speechWindow = window as unknown as {
    SpeechRecognition?: RecognitionConstructor;
    webkitSpeechRecognition?: RecognitionConstructor;
  };
  return speechWindow.SpeechRecognition ?? speechWindow.webkitSpeechRecognition ?? null;
}

const noopSubscribe = () => () => {};

/**
 * Dettatura col microfono, come su Gemini: usa il riconoscimento vocale già dentro il browser
 * (gratis, nessun servizio nostro). Il testo compare nel campo mentre si parla, aggiunto a quello
 * già scritto; la lingua è quella del browser. Dove il browser non lo supporta `supported` è false
 * e il tasto microfono semplicemente non compare.
 */
export function useSpeechDictation(value: string, onChange: (value: string) => void) {
  const supported = useSyncExternalStore(noopSubscribe, () => getRecognitionConstructor() !== null, () => false);
  const [listening, setListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<Recognition | null>(null);

  // Uscendo dalla pagina il microfono si spegne sempre.
  useEffect(() => () => recognitionRef.current?.abort(), []);

  function start() {
    const Constructor = getRecognitionConstructor();
    if (!Constructor || listening) return;
    setError(null);

    const baseText = value.trim();
    const recognition = new Constructor();
    recognition.lang = navigator.language;
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.onresult = (event) => {
      const spoken = Array.from(event.results, (result) => result[0].transcript).join("").trim();
      onChange(baseText && spoken ? `${baseText} ${spoken}` : baseText || spoken);
    };
    recognition.onerror = (event) => {
      if (event.error === "not-allowed" || event.error === "service-not-allowed") {
        setError("Allow the microphone in your browser to dictate.");
      } else if (event.error !== "no-speech" && event.error !== "aborted") {
        setError("The microphone didn't work. Please try again.");
      }
    };
    recognition.onend = () => {
      recognitionRef.current = null;
      setListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
    setListening(true);
  }

  function stop() {
    recognitionRef.current?.stop();
  }

  /** Spegne subito scartando le ultime parole ancora in arrivo: serve all'invio, altrimenti
   * riapparirebbero nel campo appena svuotato. */
  function cancel() {
    const recognition = recognitionRef.current;
    if (!recognition) return;
    recognition.onresult = null;
    recognition.abort();
  }

  return { supported, listening, error, start, stop, cancel };
}
