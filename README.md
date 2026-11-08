# Puskesmas Arbes — Aplikasi Mobile

Aplikasi mobile sistem informasi Puskesmas Arbes untuk petugas puskesmas. Dibangun dengan **React Native + Expo (SDK 58)**, **TypeScript**, dan **Expo Router**. Metode pengembangan: **Scrum** (sprint 2 minggu).

> Versi ini adalah **MVP fungsional dengan data mock** (in-memory). Cocok untuk demo alur kerja, validasi UI/UX, dan basis pengembangan backend.

---

## Fitur yang Sudah Berjalan

| Modul | Fitur |
| --- | --- |
| **Autentikasi & RBAC** | Login/logout, sesi tersimpan (AsyncStorage), 6 peran dengan menu berbeda, reset password oleh admin |
| **Manajemen Pengguna** | Daftar akun, tambah pengguna, aktif/nonaktif, reset password, ringkasan hak akses per peran |
| **Pendaftaran Pasien** | Pencarian pasien, registrasi baru, validasi NIK 16 digit & unik, No. RM otomatis, edit data, detail + riwayat kunjungan, cetak kartu (demo) |
| **Antrian** | Ambil nomor per poli (U/G/A/K/T), prioritas (lansia, ibu hamil, dll.), estimasi tunggu, panggil, selesai, batal, tiket digital, **display antrean** layar besar |
| **Rekam Medis (EMR)** | Daftar pasien per poli, keluhan, pemeriksaan fisik (TD, nadi, suhu, RR, BB, TB), diagnosis, tindakan, catatan, rujukan, kontrol ulang, resep elektronik |
| **Farmasi** | Stok obat, peringatan stok minimum & kadaluarsa, penerimaan/pengeluaran stok, resep elektronik, penyerahan obat (stok otomatis berkurang) |
| **Pembayaran** | Tagihan otomatis dari pemeriksaan, daftar tarif, proses bayar (Tunai/BPJS/Transfer), bukti & riwayat transaksi, ringkasan pendapatan |
| **Laporan** | Dashboard kunjungan, per poli, penyakit terbanyak, penggunaan obat, petugas aktif, export/bagikan laporan |

---

## Akun Demo

| Peran | Username | Password |
| --- | --- | --- |
| Administrator | `admin` | `admin123` |
| Petugas Pendaftaran | `pendaftaran` | `123456` |
| Dokter | `dokter` | `123456` |
| Perawat | `perawat` | `123456` |
| Petugas Farmasi | `farmasi` | `123456` |
| Petugas Kasir | `kasir` | `123456` |

Di layar login tersedia tombol akun demo untuk mengisi kredensial otomatis.

---

## Menjalankan Aplikasi

Prasyarat: Node.js 18+ (disarankan 20/22) dan aplikasi **Expo Go** di perangkat, atau emulator Android/iOS.

```bash
cd puskesmas-arbes
npm install
npm start
```

Lalu:

- Scan QR dengan **Expo Go** (Android/iOS), atau
- Tekan `a` untuk emulator Android, `i` untuk simulator iOS (macOS), `w` untuk browser.

Perintah lain:

```bash
npx tsc --noEmit     # typecheck
npx expo lint        # lint
npx expo export --platform web   # smoke test bundling
```

---

## Struktur Proyek

```
src/
├─ app/                         # Route Expo Router
│  ├─ _layout.tsx               # Provider (data + auth) & Stack root
│  ├─ index.tsx                 # Splash / redirect berdasarkan sesi
│  ├─ login.tsx                 # Login + akun demo
│  └─ (app)/                    # Area terproteksi (butuh login)
│     ├─ home.tsx               # Dashboard sesuai peran
│     ├─ antrian/               # Daftar, ambil, tiket, display
│     ├─ pendaftaran/           # Daftar pasien, form, detail
│     ├─ pemeriksaan/           # Worklist dokter & form EMR
│     ├─ farmasi/               # Stok & resep elektronik
│     ├─ pembayaran/            # Tagihan, tarif, riwayat
│     ├─ laporan/               # Dashboard & export laporan
│     ├─ pengguna/              # Manajemen akun (admin)
│     └─ profil.tsx             # Profil & logout
├─ components/
│  ├─ page.tsx                  # Layout halaman + header + footer
│  ├─ app-header.tsx
│  ├─ menu-grid.tsx
│  ├─ section-title.tsx
│  └─ ui/                       # Button, Input, Chips, Badge, Card, dll.
├─ constants/theme.ts           # Design token (warna, spacing, radius)
└─ lib/
   ├─ types.ts                  # Tipe domain
   ├─ seed.ts                   # Data demo
   ├─ data.tsx                  # Store mock + aksi (queue, EMR, obat, tagihan)
   ├─ auth.tsx                  # Sesi & login
   ├─ roles.ts                  # Peran, poli, menu per peran
   ├─ format.ts                 # Format tanggal/uang/NIK
   └─ ui-helpers.ts             # Status antrean, stok, kadaluarsa
```

---

## Design System

| Token | Nilai |
| --- | --- |
| Primary | `#16A34A` · dark `#15803D` · tint `#DCFCE7` |
| Secondary | `#2563EB` |
| Background | `#F1F5F9` · surface `#FFFFFF` |
| Text | `#0F172A` · muted `#64748B` |
| Danger / Warning / Info | `#DC2626` / `#F59E0B` / `#0EA5E9` |
| Radius | card 16 · button 12 · chip 999 |
| Status antrean | Menunggu kuning · Dipanggil biru · Selesai hijau · Prioritas merah |

Font memakai font sistem (mudah dibaca & ringan). Layout dioptimalkan untuk layar 390×844.

---

## Catatan & Roadmap

- **Data masih mock**: perubahan tersimpan selama aplikasi berjalan (state React). Refresh/reload mengembalikan data seed. Sesi login tetap tersimpan via AsyncStorage.
- **Backend**: rekomendasi REST API + JWT (atau Supabase). Titik integrasi sudah terpusat di `src/lib/data.tsx` dan `src/lib/auth.tsx`.
- **Fitur lanjutan**: cetak kartu/PDF nyata, notifikasi & panggilan suara display, export CSV/Excel, audit log, enkripsi data pasien, integrasi BPJS (PCare/Antrean), dan sinkronisasi offline.
- **Scrum**: Sprint 1–3 (auth/RBAC, pengguna, pendaftaran, antrian) + EMR/farmasi/pembayaran/laporan sudah tercakup pada demo ini untuk memvalidasi alur end-to-end.

---

© 2026 Puskesmas Arbes · Dibangun dengan Expo.
