import { useCallback, useEffect, useRef } from 'react';
import type {
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
} from 'react-native';

import { AUTO_SCROLL_RESUME_DELAY } from '@/constants/layout';
import { useSttStore } from '@/store/sttStore';

interface UseAutoScrollResult {
  scrollRef: React.RefObject<ScrollView | null>;
  onScrollBeginDrag: () => void;
  onScrollEndDrag: () => void;
  onContentSizeChange: () => void;
  onMomentumScrollEnd: (e: NativeSyntheticEvent<NativeScrollEvent>) => void;
}

export function useAutoScroll(dep: unknown): UseAutoScrollResult {
  const scrollRef = useRef<ScrollView | null>(null);
  const resumeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const setAutoScrollPaused = useSttStore((s) => s.setAutoScrollPaused);
  const autoScrollPaused = useSttStore((s) => s.autoScrollPaused);

  const scrollToEnd = useCallback(() => {
    scrollRef.current?.scrollToEnd({ animated: true });
  }, []);

  useEffect(() => {
    if (autoScrollPaused) return;
    const id = requestAnimationFrame(scrollToEnd);
    return () => cancelAnimationFrame(id);
  }, [dep, autoScrollPaused, scrollToEnd]);

  const onScrollBeginDrag = useCallback(() => {
    if (resumeTimer.current) {
      clearTimeout(resumeTimer.current);
      resumeTimer.current = null;
    }
    setAutoScrollPaused(true);
  }, [setAutoScrollPaused]);

  const onScrollEndDrag = useCallback(() => {
    if (resumeTimer.current) clearTimeout(resumeTimer.current);
    resumeTimer.current = setTimeout(() => {
      setAutoScrollPaused(false);
      resumeTimer.current = null;
    }, AUTO_SCROLL_RESUME_DELAY);
  }, [setAutoScrollPaused]);

  const onContentSizeChange = useCallback(() => {
    if (!autoScrollPaused) scrollToEnd();
  }, [autoScrollPaused, scrollToEnd]);

  const onMomentumScrollEnd = useCallback(
    (_: NativeSyntheticEvent<NativeScrollEvent>) => {
      /* placeholder: keep for future inertia handling */
    },
    [],
  );

  useEffect(
    () => () => {
      if (resumeTimer.current) clearTimeout(resumeTimer.current);
    },
    [],
  );

  return {
    scrollRef,
    onScrollBeginDrag,
    onScrollEndDrag,
    onContentSizeChange,
    onMomentumScrollEnd,
  };
}
