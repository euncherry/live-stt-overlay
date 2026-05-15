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
  console.log(`[mic] PermissionsAndroid.check(RECORD_AUDIO) → ${has}`);
  return has ? 'granted' : 'undetermined';
}

async function requestAndroid(): Promise<PermissionStatus> {
  console.log('[mic] PermissionsAndroid.request(RECORD_AUDIO) called');
  const result = await PermissionsAndroid.request(RECORD_AUDIO);
  console.log(`[mic] request returned: ${result}`);
  if (result === PermissionsAndroid.RESULTS.GRANTED) return 'granted';
  return 'denied';
}

export function useMicPermission(): UseMicPermissionResult {
  const [status, setStatus] = useState<PermissionStatus>('undetermined');
  const requestedRef = useRef(false);
  const appState = useRef<AppStateStatus>(AppState.currentState);

  const refresh = useCallback(async (): Promise<PermissionStatus> => {
    if (Platform.OS !== 'android') {
      console.log('[mic] non-android platform → granted');
      setStatus('granted');
      return 'granted';
    }
    const next = await refreshAndroid();
    const resolved: PermissionStatus =
      next === 'granted'
        ? 'granted'
        : requestedRef.current
          ? 'denied'
          : 'undetermined';
    console.log(`[mic] refresh resolved → ${resolved}`);
    setStatus(resolved);
    return resolved;
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
    console.log('[mic] openSettings()');
    await Linking.openSettings();
  }, []);

  useEffect(() => {
    console.log('[mic] hook mount → initial refresh');
    void refresh();
    const sub = AppState.addEventListener('change', (nextState) => {
      console.log(
        `[mic] AppState change: ${appState.current} → ${nextState}`,
      );
      if (
        appState.current.match(/inactive|background/) &&
        nextState === 'active'
      ) {
        console.log('[mic] returned to foreground → refresh');
        void refresh();
      }
      appState.current = nextState;
    });
    return () => {
      console.log('[mic] hook unmount');
      sub.remove();
    };
  }, [refresh]);

  return { status, request, refresh, openSettings };
}
