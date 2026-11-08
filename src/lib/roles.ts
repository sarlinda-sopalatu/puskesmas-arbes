import { Ionicons } from '@expo/vector-icons';

import { Colors } from '@/constants/theme';
import type { Role } from '@/lib/types';

export const ROLE_LABEL: Record<Role, string> = {
  admin: 'Administrator',
  pendaftaran: 'Petugas Pendaftaran',
  dokter: 'Dokter',
  perawat: 'Perawat',
  farmasi: 'Petugas Farmasi',
  kasir: 'Petugas Kasir',
};

export type Poli = {
  value: string;
  label: string;
  prefix: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  bg: string;
};

export const POLI_LIST: Poli[] = [
  {
    value: 'Umum',
    label: 'Poli Umum',
    prefix: 'U',
    icon: 'medkit-outline',
    color: Colors.primary,
    bg: Colors.primaryLight,
  },
  {
    value: 'Gigi',
    label: 'Poli Gigi',
    prefix: 'G',
    icon: 'happy-outline',
    color: Colors.cyan,
    bg: Colors.cyanLight,
  },
  {
    value: 'Anak',
    label: 'Poli Anak',
    prefix: 'A',
    icon: 'balloon-outline',
    color: Colors.purple,
    bg: Colors.purpleLight,
  },
  {
    value: 'KIA',
    label: 'Poli KIA',
    prefix: 'K',
    icon: 'woman-outline',
    color: Colors.pink,
    bg: Colors.pinkLight,
  },
  {
    value: 'TB Paru',
    label: 'Poli TB Paru',
    prefix: 'T',
    icon: 'pulse-outline',
    color: Colors.amber,
    bg: Colors.amberLight,
  },
];

export function getPoli(value: string): Poli | undefined {
  return POLI_LIST.find((p) => p.value === value);
}

export function poliPrefix(value: string): string {
  return getPoli(value)?.prefix ?? 'U';
}

export type MenuItem = {
  key: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  route: string;
  color: string;
  bg: string;
  roles: Role[];
};

export const MENU_ITEMS: MenuItem[] = [
  {
    key: 'pendaftaran',
    label: 'Pendaftaran',
    icon: 'person-add-outline',
    route: '/pendaftaran',
    color: Colors.primary,
    bg: Colors.primaryLight,
    roles: ['admin', 'pendaftaran'],
  },
  {
    key: 'antrian',
    label: 'Antrian',
    icon: 'people-outline',
    route: '/antrian',
    color: Colors.secondary,
    bg: Colors.secondaryLight,
    roles: ['admin', 'pendaftaran', 'dokter', 'perawat'],
  },
  {
    key: 'pemeriksaan',
    label: 'Pemeriksaan',
    icon: 'medkit-outline',
    route: '/pemeriksaan',
    color: Colors.purple,
    bg: Colors.purpleLight,
    roles: ['admin', 'dokter', 'perawat'],
  },
  {
    key: 'farmasi',
    label: 'Farmasi',
    icon: 'flask-outline',
    route: '/farmasi',
    color: Colors.cyan,
    bg: Colors.cyanLight,
    roles: ['admin', 'farmasi'],
  },
  {
    key: 'pembayaran',
    label: 'Pembayaran',
    icon: 'card-outline',
    route: '/pembayaran',
    color: Colors.amber,
    bg: Colors.amberLight,
    roles: ['admin', 'kasir'],
  },
  {
    key: 'laporan',
    label: 'Laporan',
    icon: 'bar-chart-outline',
    route: '/laporan',
    color: Colors.pink,
    bg: Colors.pinkLight,
    roles: ['admin', 'kasir'],
  },
  {
    key: 'pengguna',
    label: 'Pengguna',
    icon: 'shield-checkmark-outline',
    route: '/pengguna',
    color: Colors.textSecondary,
    bg: '#E2E8F0',
    roles: ['admin'],
  },
];

export function menuForRole(role: Role): MenuItem[] {
  return MENU_ITEMS.filter((item) => item.roles.includes(role));
}
