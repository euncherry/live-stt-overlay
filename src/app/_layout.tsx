import { Stack } from 'expo-router';
import * as ScreenOrientation from 'expo-screen-orientation';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { themes } from '@/constants/theme';
import { useSettingsStore } from '@/store/settingsStore';

export default function RootLayout() {
  const theme = useSettingsStore((s) => s.theme);
  const tokens = themes[theme];

  useEffect(() => {
    console.log('[layout] mounted, locking orientation to landscape');
    ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE)
      .then(() => console.log('[layout] orientation locked'))
      .catch((e) => console.warn('[layout] orientation lock failed:', e));
  }, []);

  return (
    <SafeAreaProvider>
      <View style={[styles.root, { backgroundColor: tokens.bg }]}>
        <StatusBar style={theme === 'dark' ? 'light' : 'dark'} hidden />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: tokens.bg },
            animation: 'fade',
          }}
        />
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});
