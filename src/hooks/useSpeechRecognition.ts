import { useCallback, useEffect, useState } from 'react';
import {
  loadModel,
  onError,
  onFinalResult,
  onPartialResult,
  onResult,
  start,
  stop,
} from 'react-native-vosk';

import { useSttStore } from '@/store/sttStore';

const MODEL_PATH = 'vosk-model-small-ko-0.22';

let loadPromise: Promise<void> | null = null;
let loaded = false;

function ensureModel(): Promise<void> {
  if (loaded) return Promise.resolve();
  if (!loadPromise) {
    loadPromise = loadModel(MODEL_PATH)
      .then(() => {
        loaded = true;
      })
      .catch((err) => {
        loadPromise = null;
        throw err;
      });
  }
  return loadPromise;
}

interface UseSpeechRecognitionResult {
  start: () => Promise<void>;
  stop: () => void;
  modelReady: boolean;
  modelError: string | null;
}

export function useSpeechRecognition(): UseSpeechRecognitionResult {
  const appendTranscript = useSttStore((s) => s.appendTranscript);
  const setListening = useSttStore((s) => s.setListening);
  const [modelReady, setModelReady] = useState<boolean>(loaded);
  const [modelError, setModelError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    ensureModel()
      .then(() => {
        if (!cancelled) {
          setModelReady(true);
          setModelError(null);
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          const msg = err instanceof Error ? err.message : String(err);
          console.warn('[stt] model load failed', msg);
          setModelError(msg);
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const partialSub = onPartialResult((text) => {
      const trimmed = (text ?? '').trim();
      if (!trimmed) return;
      appendTranscript(trimmed, false);
    });
    const resultSub = onResult((text) => {
      const trimmed = (text ?? '').trim();
      if (!trimmed) return;
      appendTranscript(trimmed, true);
    });
    const finalSub = onFinalResult((text) => {
      const trimmed = (text ?? '').trim();
      if (!trimmed) return;
      appendTranscript(trimmed, true);
    });
    const errorSub = onError((e: unknown) => {
      const msg = e instanceof Error ? e.message : String(e);
      console.warn('[stt] vosk error', msg);
      setListening(false);
    });
    return () => {
      partialSub.remove();
      resultSub.remove();
      finalSub.remove();
      errorSub.remove();
    };
  }, [appendTranscript, setListening]);

  const startStt = useCallback(async () => {
    try {
      await ensureModel();
      await start();
      setListening(true);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.warn('[stt] start failed', msg);
      setListening(false);
    }
  }, [setListening]);

  const stopStt = useCallback(() => {
    try {
      stop();
    } catch (err) {
      console.warn('[stt] stop failed', err);
    }
    setListening(false);
  }, [setListening]);

  return { start: startStt, stop: stopStt, modelReady, modelError };
}
