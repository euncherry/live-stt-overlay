import { useRouter } from 'expo-router';
import { Shield } from 'lucide-react-native';
import { useEffect, useRef } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { TOUCH_TARGET_MIN } from '@/constants/layout';
import { themes } from '@/constants/theme';
import { useMicPermission } from '@/hooks/useMicPermission';
import { useSettingsStore } from '@/store/settingsStore';

export default function PermissionScreen() {
  const router = useRouter();
  const theme = useSettingsStore((s) => s.theme);
  const tokens = themes[theme];
  const { status, request, openSettings } = useMicPermission();
  const requestedRef = useRef(false);

  useEffect(() => {
    console.log(`[permission-screen] effect, status=${status}`);
    if (status === 'granted') {
      console.log('[permission-screen] granted → navigating to /main');
      router.replace('/main');
      return;
    }
    if (status === 'undetermined' && !requestedRef.current) {
      console.log('[permission-screen] undetermined → triggering request');
      requestedRef.current = true;
      void request();
    }
  }, [status, request, router]);

  const denied = status === 'denied';

  return (
    <View style={[styles.root, { backgroundColor: tokens.bg }]}>
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <View style={[styles.iconBadge, { backgroundColor: tokens.controlBg }]}>
          <Shield size={32} color={tokens.accent} strokeWidth={2.2} />
        </View>
        <Text style={[styles.title, { color: tokens.text }]}>
          {denied ? '마이크 권한 필요' : '마이크 권한 확인 중'}
        </Text>
        <Text style={[styles.body, { color: tokens.subText }]}>
          {denied
            ? '마이크 권한이 없어 STT 기능을 사용할 수 없습니다.\n시스템 설정에서 권한을 허용해 주세요.'
            : '음성 인식을 위해 마이크 사용 권한을 요청합니다.'}
        </Text>

        {denied ? (
          <Pressable
            onPress={() => void openSettings()}
            accessibilityRole="button"
            accessibilityLabel="설정으로 이동"
            hitSlop={8}
            style={({ pressed }) => [
              styles.cta,
              {
                backgroundColor: tokens.accent,
                opacity: pressed ? 0.85 : 1,
              },
            ]}
          >
            <Text style={styles.ctaLabel}>설정으로 이동</Text>
          </Pressable>
        ) : (
          <Pressable
            onPress={() => void request()}
            accessibilityRole="button"
            accessibilityLabel="권한 다시 요청"
            hitSlop={8}
            style={({ pressed }) => [
              styles.secondary,
              {
                borderColor: tokens.border,
                opacity: pressed ? 0.7 : 1,
              },
            ]}
          >
            <Text style={[styles.secondaryLabel, { color: tokens.text }]}>
              권한 요청 다시 시도
            </Text>
          </Pressable>
        )}
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
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 48,
    gap: 20,
  },
  iconBadge: {
    width: 72,
    height: 72,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
  },
  body: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: 560,
  },
  cta: {
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 12,
    minHeight: TOUCH_TARGET_MIN,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  ctaLabel: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  secondary: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    minHeight: TOUCH_TARGET_MIN,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
  },
  secondaryLabel: {
    fontSize: 15,
    fontWeight: '600',
  },
});
