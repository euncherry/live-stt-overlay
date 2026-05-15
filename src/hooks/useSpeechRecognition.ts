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
let partialCount = 0;

function ensureModel(): Promise<void> {
  if (loaded) {
    console.log('[stt] ensureModel: already loaded');
    return Promise.resolve();
  }
  if (!loadPromise) {
    console.log(`[stt] ensureModel: loading model "${MODEL_PATH}"...`);
    const t0 = Date.now();
    loadPromise = loadModel(MODEL_PATH)
      .then(() => {
        loaded = true;
        console.log(
          `[stt] ensureModel: load OK (${((Date.now() - t0) / 1000).toFixed(2)}s)`,
        );
      })
      .catch((err) => {
        loadPromise = null;
        console.error('[stt] ensureModel: load FAILED', err);
        throw err;
      });
  } else {
    console.log('[stt] ensureModel: load already in flight, awaiting');
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
    console.log('[stt] hook mount → kicking off model preload');
    let cancelled = false;
    ensureModel()
      .then(() => {
        if (!cancelled) {
          console.log('[stt] hook: model ready → setModelReady(true)');
          setModelReady(true);
          setModelError(null);
        } else {
          console.log('[stt] hook: model ready but component unmounted');
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          const msg = err instanceof Error ? err.message : String(err);
          console.warn('[stt] hook: model load rejected:', msg);
          setModelError(msg);
        }
      });
    return () => {
      console.log('[stt] hook unmount');
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    console.log('[stt] subscribing to Vosk events');
    const partialSub = onPartialResult((text) => {
      const trimmed = (text ?? '').trim();
      partialCount += 1;
      if (partialCount <= 3 || partialCount % 10 === 0) {
        console.log(
          `[stt] onPartialResult #${partialCount}: "${trimmed.slice(0, 60)}"`,
        );
      }
      if (!trimmed) return;
      appendTranscript(trimmed, false);
    });
    const resultSub = onResult((text) => {
      const trimmed = (text ?? '').trim();
      console.log(`[stt] onResult (FINAL): "${trimmed}"`);
      if (!trimmed) return;
      appendTranscript(trimmed, true);
    });
    const finalSub = onFinalResult((text) => {
      const trimmed = (text ?? '').trim();
      console.log(`[stt] onFinalResult (stop): "${trimmed}"`);
      if (!trimmed) return;
      appendTranscript(trimmed, true);
    });
    const errorSub = onError((e: unknown) => {
      const msg = e instanceof Error ? e.message : String(e);
      console.warn('[stt] onError:', msg);
      setListening(false);
    });
    return () => {
      console.log('[stt] unsubscribing Vosk events');
      partialSub.remove();
      resultSub.remove();
      finalSub.remove();
      errorSub.remove();
    };
  }, [appendTranscript, setListening]);

  const startStt = useCallback(async () => {
    console.log('[stt] startStt called');
    try {
      console.log('[stt] startStt: awaiting model...');
      await ensureModel();
      console.log('[stt] startStt: calling Vosk.start()');
      partialCount = 0;
      await start();
      console.log('[stt] startStt: Vosk.start() resolved → setListening(true)');
      setListening(true);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error('[stt] startStt: FAILED', msg);
      setListening(false);
    }
  }, [setListening]);

  const stopStt = useCallback(() => {
    console.log('[stt] stopStt called');
    try {
      stop();
      console.log('[stt] stopStt: Vosk.stop() invoked');
    } catch (err) {
      console.warn('[stt] stopStt: stop() threw', err);
    }
    setListening(false);
  }, [setListening]);

  return { start: startStt, stop: stopStt, modelReady, modelError };
}
