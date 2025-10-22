export const palette = {
  light: {
    background: '#f8fafc',
    surface: '#ffffff',
    text: '#0f172a',
    subtitle: '#475569',
    primary: '#2563eb',
    muted: '#94a3b8',
    border: '#e2e8f0',
    tabBarBackground: '#ffffff',
    drawerBackground: '#ffffff',
    switchTrackOn: '#3b82f6',
    switchTrackOff: '#94a3b8',
    switchThumb: '#f8fafc',
  },
  dark: {
    background: '#0f172a',
    surface: '#1e293b',
    text: '#e2e8f0',
    subtitle: '#cbd5f5',
    primary: '#60a5fa',
    muted: '#475569',
    border: '#334155',
    tabBarBackground: '#1e293b',
    drawerBackground: '#0f172a',
    switchTrackOn: '#3b82f6',
    switchTrackOff: '#475569',
    switchThumb: '#1e293b',
  },
} as const;

export type Theme = keyof typeof palette;
export type ThemeColors = (typeof palette)[Theme];
