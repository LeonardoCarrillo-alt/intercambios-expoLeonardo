export const palette = {
  light: {
    background: '#f8fafc',
    surface: '#ffffff',
    text: '#0f172a',
    textSecondary: '#64748b',
    subtitle: '#475569',
    primary: '#2563eb',
    muted: '#94a3b8',
    border: '#e2e8f0',
    shadow: '#000000',
    error: '#ef4444',
    success: '#10b981',
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
    textSecondary: '#94a3b8',
    subtitle: '#cbd5f5',
    primary: '#60a5fa',
    muted: '#475569',
    border: '#334155',
    shadow: '#000000',
    error: '#f87171',
    success: '#34d399',
    tabBarBackground: '#1e293b',
    drawerBackground: '#0f172a',
    switchTrackOn: '#3b82f6',
    switchTrackOff: '#475569',
    switchThumb: '#1e293b',
  },
} as const;



export type Theme = keyof typeof palette;
export type ThemeColors = {
  background: string;
  surface: string;
  text: string;
  textSecondary: string; 
  subtitle: string;
  primary: string;
  muted: string;
  border: string;
  shadow: string;
  error?: string;
  success?: string;
  tabBarBackground: string;
  drawerBackground: string;
  switchTrackOn: string;
  switchTrackOff: string;
  switchThumb: string;
};
