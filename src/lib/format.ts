const BULAN_SINGKAT = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'Mei',
  'Jun',
  'Jul',
  'Agu',
  'Sep',
  'Okt',
  'Nov',
  'Des',
];

const BULAN_PANJANG = [
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember',
];

/** Tanggal lokal (bukan UTC) dalam format yyyy-mm-dd. */
export function toISODate(date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function parseISODate(iso: string): Date | null {
  if (!iso) return null;
  const [y, m, d] = iso.split('-').map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d);
}

/** "2026-11-08" -> "8 Nov 2026" */
export function formatTanggal(iso: string): string {
  const date = parseISODate(iso);
  if (!date) return iso;
  return `${date.getDate()} ${BULAN_SINGKAT[date.getMonth()]} ${date.getFullYear()}`;
}

/** "2026-11-08" -> "8 November 2026" */
export function formatTanggalPanjang(iso: string): string {
  const date = parseISODate(iso);
  if (!date) return iso;
  return `${date.getDate()} ${BULAN_PANJANG[date.getMonth()]} ${date.getFullYear()}`;
}

/** "2026-11" -> "Nov 2026" */
export function formatBulan(isoMonth: string): string {
  const [y, m] = isoMonth.split('-').map(Number);
  if (!y || !m) return isoMonth;
  return `${BULAN_SINGKAT[m - 1]} ${y}`;
}

export function formatRupiah(n: number): string {
  const rounded = Math.round(n);
  const sign = rounded < 0 ? '-' : '';
  const digits = Math.abs(rounded)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `${sign}Rp ${digits}`;
}

export function formatRupiahSingkat(n: number): string {
  if (n >= 1_000_000) {
    return `Rp ${(n / 1_000_000).toFixed(1).replace('.', ',')} jt`;
  }
  if (n >= 10_000) {
    return `Rp ${Math.round(n / 1000)} rb`;
  }
  return formatRupiah(n);
}

export function umur(tanggalLahir: string): number {
  const date = parseISODate(tanggalLahir);
  if (!date) return 0;
  const now = new Date();
  let age = now.getFullYear() - date.getFullYear();
  const belumUlangTahun =
    now.getMonth() < date.getMonth() ||
    (now.getMonth() === date.getMonth() && now.getDate() < date.getDate());
  if (belumUlangTahun) age -= 1;
  return Math.max(age, 0);
}

export function formatJam(isoDateTime?: string): string {
  if (!isoDateTime) return '-';
  const date = new Date(isoDateTime);
  if (Number.isNaN(date.getTime())) return '-';
  return `${String(date.getHours()).padStart(2, '0')}.${String(date.getMinutes()).padStart(2, '0')}`;
}

export function nowIso(): string {
  return new Date().toISOString();
}

export function maskNik(nik: string): string {
  if (nik.length < 8) return nik;
  return `${nik.slice(0, 4)}${'*'.repeat(Math.max(nik.length - 8, 0))}${nik.slice(-4)}`;
}

export function inisial(nama: string): string {
  const parts = nama.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}
