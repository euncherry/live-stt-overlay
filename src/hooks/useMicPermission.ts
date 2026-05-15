import { useCallback, useEffect, useRef, useState } from 'react';
import {
  AppState,
  type AppStateStatus,
  Linking,
  PermissionsAndroid,
  Platform,
} from 'react-native';

export type PermissionStatus = 'granted' | 'denied' | 'undetermined';

interface UseMicPermissionResult {
  status: PermissionStatus;
  request: () => Promise<PermissionStatus>;
  refresh: () => Promise<PermissionStatus>;
  openSettings: () => Promise<void>;
}

const RECORD_AUDIO = PermissionsAndroid.PERMISSIONS.RECORD_AUDIO;

async function refreshAndroid(): Promise<PermissionStatus> {
  const has = await PermissionsAndroid.check(RECORD_AUDIO);
  return has ? 'granted' : 'undetermined';
}

async function requestAndroid(): Promise<PermissionStatus> {
  const result = await PermissionsAndroid.request(RECORD_AUDIO);
  if (result === PermissionsAndroid.RESULTS.GRANTED) return 'granted';
  return 'denied';
}

export function useMicPermission(): UseMicPermissionResult {
  const [status, setStatus] = useState<PermissionStatus>('undetermined');
  const requestedRef = useRef(false);
  const appState = useRef<AppStateStatus>(AppState.currentState);

  const refresh = useCallback(async (): Promise<PermissionStatus> => {
    if (Platform.OS !== 'android') {
      setStatus('granted');
      return 'granted';
    }
    const next = await refreshAndroid();
    setStatus((prev) => {
      if (next === 'granted') return 'granted';
      return requestedRef.current ? 'denied' : 'undetermined';
    });
    return next === 'granted'
      ? 'granted'
      : requestedRef.current
        ? 'denied'
        : 'undetermined';
  }, []);

  const request = useCallback(async (): Promise<PermissionStatus> => {
    if (Platform.OS !== 'android') {
      setStatus('granted');
      return 'granted';
    }
    requestedRef.current = true;
    const next = await requestAndroid();
    setStatus(next);
    return next;
  }, []);

  const openSettings = useCallback(async () => {
    await Linking.openSettings();
  }, []);

  useEffect(() => {
    void refresh();
    const sub = AppState.addEventListener('change', (nextState) => {
      if (
        appState.current.match(/inactive|background/) &&
        nextState === 'active'
      ) {
        void refresh();
      }
      appState.current = nextState;
    });
    return () => sub.remove();
  }, [refresh]);

  return { status, request, refresh, openSettings };
}
