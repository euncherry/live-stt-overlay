import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { LINE_HEIGHT_RATIO } from '@/constants/layout';
import { themes } from '@/constants/theme';
import { useAutoScroll } from '@/hooks/useAutoScroll';
import { useSettingsStore } from '@/store/settingsStore';
import { useSttStore } from '@/store/sttStore';

const IDLE_HINT = '시작 버튼을 눌러 음성 인식을 시작하세요';

export function CaptionView() {
  const theme = useSettingsStore((s) => s.theme);
  const fontSize = useSettingsStore((s) => s.fontSize);
  const transcript = useSttStore((s) => s.transcript);
  const interim = useSttStore((s) => s.interimSegment);
  const isListening = useSttStore((s) => s.isListening);
  const tokens = themes[theme];

  const composed = [transcript, interim].filter(Boolean).join(' ').trim();

  const { scrollRef, onScrollBeginDrag, onScrollEndDrag, onContentSizeChange } =
    useAutoScroll(composed);

  if (!isListening && composed.length === 0) {
    return (
      <View style={[styles.idleContainer, { backgroundColor: tokens.bg }]}>
        <Text
          style={[
            styles.idleText,
            { color: tokens.subText, fontSize: fontSize * 0.75 },
          ]}
        >
          {IDLE_HINT}
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      ref={scrollRef}
      style={[styles.scroll, { backgroundColor: tokens.bg }]}
      contentContainerStyle={styles.content}
      onScrollBeginDrag={onScrollBeginDrag}
      onScrollEndDrag={onScrollEndDrag}
      onContentSizeChange={onContentSizeChange}
      showsVerticalScrollIndicator
    >
      <Text
        style={[
          styles.text,
          {
            color: tokens.text,
            fontSize,
            lineHeight: fontSize * LINE_HEIGHT_RATIO,
          },
        ]}
      >
        {transcript}
        {interim ? (
          <Text style={{ color: tokens.subText }}>
            {transcript ? ' ' : ''}
            {interim}
          </Text>
        ) : null}
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 32,
    paddingVertical: 28,
    flexGrow: 1,
  },
  text: {
    fontWeight: '500',
  },
  idleContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  idleText: {
    textAlign: 'center',
    fontWeight: '500',
  },
});
