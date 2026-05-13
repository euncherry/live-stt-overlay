import Slider from '@react-native-community/slider';
import { StyleSheet, Text, View } from 'react-native';

import { FONT_SIZE, TOUCH_TARGET_MIN } from '@/constants/layout';
import { themes } from '@/constants/theme';
import { useSettingsStore } from '@/store/settingsStore';

export function FontSizeSlider() {
  const theme = useSettingsStore((s) => s.theme);
  const fontSize = useSettingsStore((s) => s.fontSize);
  const setFontSize = useSettingsStore((s) => s.setFontSize);
  const tokens = themes[theme];

  return (
    <View style={styles.container}>
      <View style={styles.labelRow}>
        <Text style={[styles.title, { color: tokens.subText }]}>글자 크기</Text>
        <Text style={[styles.value, { color: tokens.text }]}>{fontSize}pt</Text>
      </View>
      <Slider
        style={styles.slider}
        minimumValue={FONT_SIZE.MIN}
        maximumValue={FONT_SIZE.MAX}
        step={1}
        value={fontSize}
        onValueChange={setFontSize}
        minimumTrackTintColor={tokens.accent}
        maximumTrackTintColor={tokens.sliderTrack}
        thumbTintColor={tokens.accent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    minHeight: TOUCH_TARGET_MIN,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  title: {
    fontSize: 13,
    fontWeight: '500',
  },
  value: {
    fontSize: 14,
    fontWeight: '600',
  },
  slider: {
    width: '100%',
    height: TOUCH_TARGET_MIN,
  },
});
