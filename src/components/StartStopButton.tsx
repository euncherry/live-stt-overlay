import { Mic, Square } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { TOUCH_TARGET_MIN } from '@/constants/layout';
import { themes } from '@/constants/theme';
import { useSettingsStore } from '@/store/settingsStore';
import { useSttStore } from '@/store/sttStore';

interface StartStopButtonProps {
  onStart: () => void;
  onStop: () => void;
}

export function StartStopButton({ onStart, onStop }: StartStopButtonProps) {
  const theme = useSettingsStore((s) => s.theme);
  const isListening = useSttStore((s) => s.isListening);
  const tokens = themes[theme];

  const handlePress = () => {
    if (isListening) {
      onStop();
    } else {
      onStart();
    }
  };

  const label = isListening ? '중지' : '시작';
  const bg = isListening ? '#E04A4A' : tokens.accent;

  return (
    <Pressable
      onPress={handlePress}
      accessibilityRole="button"
      accessibilityLabel={isListening ? '음성 인식 중지' : '음성 인식 시작'}
      hitSlop={8}
      style={({ pressed }) => [
        styles.container,
        { backgroundColor: bg, opacity: pressed ? 0.85 : 1 },
      ]}
    >
      <View style={styles.iconWrap}>
        {isListening ? (
          <Square size={20} color="#FFFFFF" strokeWidth={2.4} fill="#FFFFFF" />
        ) : (
          <Mic size={22} color="#FFFFFF" strokeWidth={2.4} />
        )}
      </View>
      <Text style={styles.label}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: TOUCH_TARGET_MIN,
    minWidth: TOUCH_TARGET_MIN * 2.2,
    paddingHorizontal: 18,
    borderRadius: 12,
    gap: 8,
  },
  iconWrap: {
    width: 22,
    height: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
