import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CaptionView } from '@/components/CaptionView';
import { ControlBar } from '@/components/ControlBar';
import { CAPTION_AREA_RATIO, CONTROL_AREA_RATIO } from '@/constants/layout';
import { themes } from '@/constants/theme';
import { useSettingsStore } from '@/store/settingsStore';

export default function MainScreen() {
  const theme = useSettingsStore((s) => s.theme);
  const tokens = themes[theme];

  return (
    <View style={[styles.root, { backgroundColor: tokens.bg }]}>
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <View style={[styles.captionArea, { flex: CAPTION_AREA_RATIO }]}>
          <CaptionView />
        </View>
        <View style={[styles.controlArea, { flex: CONTROL_AREA_RATIO }]}>
          <ControlBar />
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  safe: {
    flex: 1,
  },
  captionArea: {
    width: '100%',
  },
  controlArea: {
    width: '100%',
  },
});
