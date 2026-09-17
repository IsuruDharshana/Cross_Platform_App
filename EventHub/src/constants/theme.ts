import '@/global.css';
import { Platform } from 'react-native';

export const Palette = {
  green: '#2F6B4F', greenDark: '#234D3A', greenSoft: '#EAF3EE',
  background: '#F7F8F6', card: '#FFFFFF', text: '#1F2924',
  textSecondary: '#6F7973', textMuted: '#97A19B', border: '#E3E8E5',
  borderStrong: '#D7E2DC', chip: '#F0F4F1', success: '#3A7A58',
  warning: '#B78A45', error: '#C95C5C', errorSoft: '#FBECEC',
} as const;

export const Colors = {
  light: {
    text: Palette.text, background: Palette.background, backgroundElement: Palette.card,
    backgroundSelected: Palette.greenSoft, textSecondary: Palette.textSecondary,
  },
  dark: {
    text: '#ffffff',
    background: '#000000',
    backgroundElement: '#212225',
    backgroundSelected: '#2E3135',
    textSecondary: '#B0B4BA',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = { half: 2, one: 4, two: 8, three: 16, four: 24, five: 32, six: 48 } as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 720;
