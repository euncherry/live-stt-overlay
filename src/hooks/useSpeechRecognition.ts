import {
  ExpoSpeechRecognitionModule,
  useSpeechRecognitionEvent,
} from 'expo-speech-recognition';
import { useCallback, useEffect, useRef } from 'react';

import { useSttStore } from '@/store/sttStore';

interface UseSpeechRecognitionResult {
  start: () => Promise<void>;
  stop: () => void;
}

export function useSpeechRecognition(): UseSpeechRecognitionResult {
  const appendTranscript = useSttStore((s) => s.appendTranscript);
  const setListening = useSttStore((s) => s.setListening);
  const stoppingRef = useRef(false);

  useSpeechRecognitionEvent('start', () => {
    console.log('[stt] event: start');
    stoppingRef.current = false;
    setListening(true);
  });

  useSpeechRecognitionEvent('end', () => {
    console.log('[stt] event: end');
    stoppingRef.current = false;
    setListening(false);
  });

  useSpeechRecognitionEvent('result', (event) => {
    const segment = event.results?.[0]?.transcript ?? '';
    console.log(
      `[stt] event: result isFinal=${event.isFinal} text="${segment.slice(0, 60)}"`,
    );
    if (!segment) return;
    appendTranscript(segment, Boolean(event.isFinal));
  });

  useSpeechRecognitionEvent('error', (event) => {
    // Android's SpeechRecognizer emits a benign "client"/"aborted" error
    // when recognition is cut short by a deliberate stop().
    if (
      stoppingRef.current &&
      (event.error === 'client' || event.error === 'aborted')
    ) {
      console.log('[stt] benign error on stop, ignored:', event.error);
      return;
    }
    console.warn('[stt] event: error', event.error, event.message);
    setListening(false);
  });

  const start = useCallback(async () => {
    console.log('[stt] start() called');
    stoppingRef.current = false;
    try {
      const perm = await ExpoSpeechRecognitionModule.getPermissionsAsync();
      console.log('[stt] permission status:', perm.status);
      await ExpoSpeechRecognitionModule.start({
        lang: 'ko-KR',
        continuous: true,
        interimResults: true,
        requiresOnDeviceRecognition: true,
        maxAlternatives: 1,
      });
      console.log('[stt] ExpoSpeechRecognitionModule.start() resolved');
    } catch (err) {
      console.error('[stt] start failed', err);
      setListening(false);
    }
  }, [setListening]);

  const stop = useCallback(() => {
    console.log('[stt] stop() called');
    stoppingRef.current = true;
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
