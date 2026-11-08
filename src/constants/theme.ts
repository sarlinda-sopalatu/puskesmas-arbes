/**
 * Design tokens — Puskesmas Arbes
 * Palet warna hijau kesehatan, tipografi sistem, dan skala spacing konsisten.
 */

export const Colors = {
  // Brand
  primary: '#16A34A',
  primaryDark: '#15803D',
  primaryLight: '#DCFCE7',
  primarySoft: '#F0FDF4',

  // Aksen modul
  secondary: '#2563EB',
  secondaryLight: '#DBEAFE',
  purple: '#7C3AED',
  purpleLight: '#EDE9FE',
  cyan: '#0891B2',
  cyanLight: '#CFFAFE',
  amber: '#D97706',
  amberLight: '#FEF3C7',
  pink: '#DB2777',
  pinkLight: '#FCE7F3',

  // Netral
  background: '#F1F5F9',
  surface: '#FFFFFF',
  text: '#0F172A',
  textSecondary: '#475569',
  textMuted: '#94A3B8',
  border: '#E2E8F0',
  borderStrong: '#CBD5E1',

  // Status
  danger: '#DC2626',
  dangerLight: '#FEE2E2',
  success: '#15803D',
  successLight: '#DCFCE7',
  warning: '#B45309',
  warningLight: '#FEF3C7',
  info: '#0369A1',
  infoLight: '#E0F2FE',

  // Lain-lain
  white: '#FFFFFF',
  black: '#000000',
  overlay: 'rgba(15, 23, 42, 0.5)',
  displayBg: '#052E16',
} as const;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
} as const;

export const Radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 999,
} as const;

export const Shadow = {
  card: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
} as const;
