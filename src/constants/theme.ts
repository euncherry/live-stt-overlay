export const themes = {
  light: {
    bg: '#FFFFFF',
    text: '#1A1A1A',
    subText: '#666666',
    accent: '#2E7AE0',
    controlBg: '#F2F2F2',
    sliderTrack: '#999999',
    border: '#E0E0E0',
  },
  dark: {
    bg: '#0A0A0A',
    text: '#FFFFFF',
    subText: '#AAAAAA',
    accent: '#4A9EFF',
    controlBg: '#1A1A1A',
    sliderTrack: '#CCCCCC',
    border: '#2A2A2A',
  },
} as const;

export type ThemeName = keyof typeof themes;
export type ThemeTokens = (typeof themes)[ThemeName];
