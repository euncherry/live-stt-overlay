import { ExpoSpeechRecognitionModule } from 'expo-speech-recognition';
import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState, type AppStateStatus, Linking } from 'react-native';

export type PermissionStatus = 'granted' | 'denied' | 'undetermined';

interface UseMicPermissionResult {
  status: PermissionStatus;
  request: () => Promise<PermissionStatus>;
  refresh: () => Promise<PermissionStatus>;
  openSettings: () => Promise<void>;
}

const normalize = (s: string | undefined): PermissionStatus => {
  if (s === 'granted') return 'granted';
  if (s === 'denied') return 'denied';
  return 'undetermined';
};

export function useMicPermission(): UseMicPermissionResult {
  const [status, setStatus] = useState<PermissionStatus>('undetermined');
  const appState = useRef<AppStateStatus>(AppState.currentState);

  const refresh = useCallback(async (): Promise<PermissionStatus> => {
    const res = await ExpoSpeechRecognitionModule.getPermissionsAsync();
    const next = normalize(res.status);
    console.log('[mic] refresh →', next);
    setStatus(next);
    return next;
  }, []);

  const request = useCallback(async (): Promise<PermissionStatus> => {
    console.log('[mic] request() called');
    const res = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
    const next = normalize(res.status);
    console.log('[mic] request →', next);
    setStatus(next);
    return next;
  }, []);

  const openSettings = useCallback(async () => {
    console.log('[mic] openSettings()');
    await Linking.openSettings();
  }, []);

  useEffect(() => {
    console.log('[mic] hook mount → initial refresh');
    void refresh();
    const sub = AppState.addEventListener('change', (nextState) => {
      if (
        appState.current.match(/inactive|background/) &&
        nextState === 'active'
      ) {
        console.log('[mic] returned to foreground → refresh');
        void refresh();
      }
      appState.current = nextState;
    });
    return () => sub.remove();
  }, [refresh]);

  return { status, request, refresh, openSettings };
}
