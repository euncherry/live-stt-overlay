import { Moon, Sun } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { TOUCH_TARGET_MIN } from '@/constants/layout';
import { themes } from '@/constants/theme';
import { useSettingsStore } from '@/store/settingsStore';

export function ThemeToggle() {
  const theme = useSettingsStore((s) => s.theme);
  const setTheme = useSettingsStore((s) => s.setTheme);
  const tokens = themes[theme];
  const isDark = theme === 'dark';

  return (
    <Pressable
      onPress={() => setTheme(isDark ? 'light' : 'dark')}
      accessibilityRole="switch"
      accessibilityState={{ checked: isDark }}
      accessibilityLabel={isDark ? '라이트 모드로 전환' : '다크 모드로 전환'}
      hitSlop={8}
      style={({ pressed }) => [
        styles.container,
        {
          backgroundColor: tokens.controlBg,
          borderColor: tokens.border,
          opacity: pressed ? 0.7 : 1,
        },
      ]}
    >
      <View style={styles.iconWrap}>
        {isDark ? (
          <Moon size={20} color={tokens.text} strokeWidth={2} />
        ) : (
          <Sun size={20} color={tokens.text} strokeWidth={2} />
        )}
      </View>
      <Text style={[styles.label, { color: tokens.text }]}>
        {isDark ? '다크' : '라이트'}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: TOUCH_TARGET_MIN,
    minWidth: TOUCH_TARGET_MIN * 2,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    gap: 8,
  },
  iconWrap: {
    width: 22,
    height: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
  },
});
