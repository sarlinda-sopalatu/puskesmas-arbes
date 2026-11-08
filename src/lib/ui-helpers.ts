import type { BadgeTone } from '@/components/ui/badge';
import type { QueueStatus } from '@/lib/types';

export const QUEUE_LABEL: Record<QueueStatus, string> = {
  menunggu: 'Menunggu',
  dipanggil: 'Dipanggil',
  selesai: 'Selesai',
  batal: 'Batal',
};

export const QUEUE_TONE: Record<QueueStatus, BadgeTone> = {
  menunggu: 'warning',
  dipanggil: 'info',
  selesai: 'success',
  batal: 'danger',
};

/** Kadaluarsa jika bulan/tahun sudah lewat dari bulan berjalan (format yyyy-mm). */
export function isKadaluarsa(kadaluarsa: string): boolean {
  const now = new Date();
  const current = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  return kadaluarsa < current;
}

/** Hampir kadaluarsa jika <= 3 bulan lagi. */
export function isHampirKadaluarsa(kadaluarsa: string): boolean {
  const now = new Date();
  const limit = new Date(now.getFullYear(), now.getMonth() + 3, 1);
  const limitKey = `${limit.getFullYear()}-${String(limit.getMonth() + 1).padStart(2, '0')}`;
  return !isKadaluarsa(kadaluarsa) && kadaluarsa <= limitKey;
}

export function stokMenipis(stok: number, minimum: number): boolean {
  return stok <= minimum;
}
