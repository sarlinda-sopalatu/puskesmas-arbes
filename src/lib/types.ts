export type Role = 'admin' | 'pendaftaran' | 'dokter' | 'perawat' | 'farmasi' | 'kasir';

export type User = {
  id: string;
  username: string;
  password: string;
  name: string;
  role: Role;
  poli?: string;
  active: boolean;
};

export type JenisKepersertaan = 'BPJS' | 'Umum';
export type JenisKelamin = 'L' | 'P';

export type Patient = {
  id: string;
  noRM: string;
  nik: string;
  nama: string;
  tempatLahir: string;
  tanggalLahir: string; // yyyy-mm-dd
  jenisKelamin: JenisKelamin;
  alamat: string;
  noTelepon: string;
  jenisKepersertaan: JenisKepersertaan;
  kontakKeluarga?: string;
  createdAt: string;
};

export type QueueStatus = 'menunggu' | 'dipanggil' | 'selesai' | 'batal';

export type QueueTicket = {
  id: string;
  nomor: number;
  kode: string;
  patientId: string;
  poli: string;
  priority: boolean;
  alasanPrioritas?: string;
  status: QueueStatus;
  tanggal: string; // yyyy-mm-dd
  estimasiMenit: number;
  createdAt: string;
  calledAt?: string;
  finishedAt?: string;
};

export type Medicine = {
  id: string;
  nama: string;
  kategori: string;
  satuan: string;
  stok: number;
  stokMinimum: number;
  harga: number;
  kadaluarsa: string; // yyyy-mm
};

export type ResepItem = {
  medicineId: string;
  jumlah: number;
  aturan: string;
};

export type PemeriksaanFisik = {
  tekananDarah: string;
  nadi: string;
  suhu: string;
  respirasi: string;
  beratBadan: string;
  tinggiBadan: string;
};

export type Examination = {
  id: string;
  patientId: string;
  queueId: string;
  dokterId: string;
  tanggal: string;
  keluhan: string;
  pemeriksaanFisik: PemeriksaanFisik;
  diagnosis: string;
  tindakan: string;
  catatan: string;
  rujukan: string;
  kontrolUlang: string;
  resep: ResepItem[];
  resepDiserahkan: boolean;
  status: 'draft' | 'selesai';
};

export type BillStatus = 'belum' | 'lunas';
export type MetodeBayar = 'Tunai' | 'BPJS' | 'Transfer';

export type BillItem = {
  label: string;
  biaya: number;
};

export type Bill = {
  id: string;
  patientId: string;
  examinationId?: string;
  tanggal: string;
  items: BillItem[];
  status: BillStatus;
  metode?: MetodeBayar;
  paidAt?: string;
};
