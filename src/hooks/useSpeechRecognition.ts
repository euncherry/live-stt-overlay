import {
  ExpoSpeechRecognitionModule,
  useSpeechRecognitionEvent,
} from 'expo-speech-recognition';
import { useCallback, useEffect } from 'react';

import { useSttStore } from '@/store/sttStore';

interface UseSpeechRecognitionResult {
  start: () => Promise<void>;
  stop: () => void;
}

export function useSpeechRecognition(): UseSpeechRecognitionResult {
  const appendTranscript = useSttStore((s) => s.appendTranscript);
  const setListening = useSttStore((s) => s.setListening);

  useSpeechRecognitionEvent('start', () => {
    setListening(true);
  });

  useSpeechRecognitionEvent('end', () => {
    setListening(false);
  });

  useSpeechRecognitionEvent('result', (event) => {
    const segment = event.results?.[0]?.transcript ?? '';
    if (!segment) return;
    appendTranscript(segment, Boolean(event.isFinal));
  });

  useSpeechRecognitionEvent('error', (event) => {
    console.warn('[stt] error', event.error, event.message);
    setListening(false);
  });

  const start = useCallback(async () => {
    try {
      await ExpoSpeechRecognitionModule.start({
        lang: 'ko-KR',
        continuous: true,
        interimResults: true,
        requiresOnDeviceRecognition: true,
        maxAlternatives: 1,
      });
    } catch (err) {
      console.warn('[stt] start failed', err);
      setListening(false);
    }
  }, [setListening]);

  const stop = useCallback(() => {
    try {
      ExpoSpeechRecognitionModule.stop();
    } catch (err) {
      console.warn('[stt] stop failed', err);
    }
  }, []);

  useEffect(
    () => () => {
      try {
        ExpoSpeechRecognitionModule.stop();
      } catch {
        /* noop */
      }
    },
    [],
  );

  return { start, stop };
}
