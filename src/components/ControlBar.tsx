import { StyleSheet, View } from 'react-native';

import { themes } from '@/constants/theme';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import { useSettingsStore } from '@/store/settingsStore';
import { useSttStore } from '@/store/sttStore';

import { FontSizeSlider } from './FontSizeSlider';
import { StartStopButton } from './StartStopButton';
import { ThemeToggle } from './ThemeToggle';

export function ControlBar() {
  const theme = useSettingsStore((s) => s.theme);
  const tokens = themes[theme];
  const resetTranscript = useSttStore((s) => s.resetTranscript);
  const { start, stop, modelReady } = useSpeechRecognition();

  const handleStart = () => {
    console.log(`[ui] StartStopButton pressed, modelReady=${modelReady}`);
    resetTranscript();
    void start();
  };

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: tokens.controlBg, borderTopColor: tokens.border },
      ]}
    >
      <View style={styles.sliderSlot}>
        <FontSizeSlider />
      </View>
      <View style={styles.actions}>
        <ThemeToggle />
        <StartStopButton
          onStart={handleStart}
          onStop={stop}
          loading={!modelReady}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    gap: 24,
  },
  sliderSlot: {
    flex: 1,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
});
