import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { ChevronRight, Mic } from 'lucide-react-native';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { TOUCH_TARGET_MIN } from '@/constants/layout';
import { themes } from '@/constants/theme';
import { useSettingsStore } from '@/store/settingsStore';

export default function LandingScreen() {
  const router = useRouter();
  const theme = useSettingsStore((s) => s.theme);
  const tokens = themes[theme];
  const { width } = useWindowDimensions();
  const titleSize = Math.min(72, Math.max(40, width * 0.07));
  const isDark = theme === 'dark';

  const gradientColors = isDark
    ? (['#0A0A0A', '#101A2E', '#0A0A0A'] as const)
    : (['#FFFFFF', '#E8F0FE', '#FFFFFF'] as const);

  return (
    <View style={[styles.root, { backgroundColor: tokens.bg }]}>
      <LinearGradient
        colors={gradientColors}
        style={StyleSheet.absoluteFill}
        start={{ x: 0.1, y: 0 }}
        end={{ x: 0.9, y: 1 }}
      />
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <View style={styles.heroRow}>
          <View
            style={[styles.iconBadge, { backgroundColor: tokens.controlBg }]}
          >
            <Mic size={28} color={tokens.accent} strokeWidth={2.2} />
          </View>
          <View style={styles.titleBlock}>
            <Text style={[styles.kicker, { color: tokens.subText }]}>
              On-device · Korean
            </Text>
            <Text
              style={[
                styles.title,
                { color: tokens.text, fontSize: titleSize },
              ]}
            >
              실시간 <Text style={{ color: tokens.accent }}>자막</Text>
            </Text>
            <Text style={[styles.subtitle, { color: tokens.subText }]}>
              마이크 음성을 즉시 텍스트로 변환합니다.
            </Text>
          </View>
        </View>

        <Pressable
          onPress={() => router.replace('/permission')}
          accessibilityRole="button"
          accessibilityLabel="시작하기"
          hitSlop={8}
          style={({ pressed }) => [
            styles.cta,
            {
              backgroundColor: tokens.accent,
              shadowColor: tokens.accent,
              opacity: pressed ? 0.9 : 1,
            },
          ]}
        >
          <Text style={styles.ctaLabel}>시작하기</Text>
          <ChevronRight size={22} color="#FFFFFF" strokeWidth={2.4} />
        </Pressable>
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
    paddingHorizontal: 64,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 48,
  },
  heroRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 24,
  },
  iconBadge: {
    width: 72,
    height: 72,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleBlock: {
    flex: 1,
  },
  kicker: {
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  title: {
    fontWeight: '800',
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: 18,
    marginTop: 12,
  },
  cta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingVertical: 18,
    borderRadius: 16,
    minHeight: TOUCH_TARGET_MIN + 12,
    gap: 10,
    shadowOpacity: 0.4,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  ctaLabel: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
});
