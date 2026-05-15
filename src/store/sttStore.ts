import { create } from 'zustand';

interface SttState {
  transcript: string;
  interimSegment: string;
  isListening: boolean;
  autoScrollPaused: boolean;
  appendTranscript: (text: string, isFinal: boolean) => void;
  resetTranscript: () => void;
  setListening: (v: boolean) => void;
  setAutoScrollPaused: (v: boolean) => void;
}

export const useSttStore = create<SttState>((set) => ({
  transcript: '',
  interimSegment: '',
  isListening: false,
  autoScrollPaused: false,
  appendTranscript: (text, isFinal) =>
    set((state) => {
      if (isFinal) {
        const next = state.transcript.length
          ? `${state.transcript} ${text}`.trim()
          : text.trim();
        console.log(
          `[store] appendTranscript final → transcript length ${next.length}`,
        );
        return { transcript: next, interimSegment: '' };
      }
      return { interimSegment: text };
    }),
  resetTranscript: () => {
    console.log('[store] resetTranscript');
    set({ transcript: '', interimSegment: '' });
  },
  setListening: (v) => {
    console.log(`[store] setListening(${v})`);
    set({ isListening: v });
  },
  setAutoScrollPaused: (v) => set({ autoScrollPaused: v }),
}));
