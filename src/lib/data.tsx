import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { nowIso, toISODate } from '@/lib/format';
import {
  SEED_BILLS,
  SEED_EXAMINATIONS,
  SEED_MEDICINES,
  SEED_PATIENTS,
  SEED_QUEUES,
  SEED_USERS,
} from '@/lib/seed';
import { poliPrefix } from '@/lib/roles';
import type {
  Bill,
  BillItem,
  Examination,
  Medicine,
  MetodeBayar,
  Patient,
  PemeriksaanFisik,
  QueueStatus,
  QueueTicket,
  ResepItem,
  Role,
  User,
} from '@/lib/types';

export type NewPatient = Omit<Patient, 'id' | 'noRM' | 'createdAt'>;

type QueueInput = {
  patientId: string;
  poli: string;
  priority: boolean;
  alasanPrioritas?: string;
};

type NewExamination = {
  queueId: string;
  patientId: string;
  dokterId: string;
  keluhan: string;
  pemeriksaanFisik: PemeriksaanFisik;
  diagnosis: string;
  tindakan: string;
  catatan: string;
  rujukan: string;
  kontrolUlang: string;
  resep: ResepItem[];
};

type NewUser = {
  username: string;
  password: string;
  name: string;
  role: Role;
  poli?: string;
};

type DataContextValue = {
  users: User[];
  patients: Patient[];
  queues: QueueTicket[];
  medicines: Medicine[];
  examinations: Examination[];
  bills: Bill[];
  addPatient: (input: NewPatient) => Patient;
  updatePatient: (id: string, input: NewPatient) => void;
  addQueue: (input: QueueInput) => QueueTicket;
  updateQueueStatus: (id: string, status: QueueStatus) => void;
  saveExamination: (input: NewExamination) => Examination;
  dispensePrescription: (examinationId: string) => void;
  receiveStock: (medicineId: string, qty: number) => void;
  dispenseStock: (medicineId: string, qty: number) => void;
  payBill: (billId: string, metode: MetodeBayar) => void;
  addUser: (input: NewUser) => { ok: boolean; error?: string };
  updateUser: (id: string, input: Partial<Omit<User, 'id'>>) => void;
  resetPassword: (id: string) => void;
  toggleUserActive: (id: string) => void;
};

const DataContext = createContext<DataContextValue | null>(null);

export function DataProvider({ children }: { children: ReactNode }) {
  const [users, setUsers] = useState<User[]>(SEED_USERS);
  const [patients, setPatients] = useState<Patient[]>(SEED_PATIENTS);
  const [queues, setQueues] = useState<QueueTicket[]>(SEED_QUEUES);
  const [medicines, setMedicines] = useState<Medicine[]>(SEED_MEDICINES);
  const [examinations, setExaminations] = useState<Examination[]>(SEED_EXAMINATIONS);
  const [bills, setBills] = useState<Bill[]>(SEED_BILLS);

  const addPatient = useCallback(
    (input: NewPatient) => {
      const year = new Date().getFullYear();
      const maxSeq = patients.reduce((max, p) => {
        const match = p.noRM.match(/(\d+)$/);
        return match ? Math.max(max, Number(match[1])) : max;
      }, 0);
      const patient: Patient = {
        ...input,
        id: `p-${Date.now()}`,
        noRM: `RM-${year}-${String(maxSeq + 1).padStart(4, '0')}`,
        createdAt: nowIso(),
      };
      setPatients((prev) => [...prev, patient]);
      return patient;
    },
    [patients],
  );

  const updatePatient = useCallback((id: string, input: NewPatient) => {
    setPatients((prev) => prev.map((p) => (p.id === id ? { ...p, ...input } : p)));
  }, []);

  const addQueue = useCallback(
    (input: QueueInput) => {
      const today = toISODate();
      const todaySamePoli = queues.filter(
        (q) => q.tanggal === today && q.poli === input.poli,
      );
      const nomor = todaySamePoli.reduce((max, q) => Math.max(max, q.nomor), 0) + 1;
      const waiting = queues.filter(
        (q) => q.tanggal === today && q.poli === input.poli && q.status === 'menunggu',
      ).length;
      const ticket: QueueTicket = {
        id: `q-${Date.now()}`,
        nomor,
        kode: `${poliPrefix(input.poli)}-${String(nomor).padStart(3, '0')}`,
        patientId: input.patientId,
        poli: input.poli,
        priority: input.priority,
        alasanPrioritas: input.alasanPrioritas,
        status: 'menunggu',
        tanggal: today,
        estimasiMenit: (waiting + 1) * 15,
        createdAt: nowIso(),
      };
      setQueues((prev) => [...prev, ticket]);
      return ticket;
    },
    [queues],
  );

  const updateQueueStatus = useCallback((id: string, status: QueueStatus) => {
    setQueues((prev) =>
      prev.map((q) => {
        if (q.id !== id) return q;
        if (status === 'dipanggil') return { ...q, status, calledAt: nowIso() };
        if (status === 'selesai') return { ...q, status, finishedAt: nowIso() };
        return { ...q, status };
      }),
    );
  }, []);

  const saveExamination = useCallback(
    (input: NewExamination) => {
      const existing = examinations.find((e) => e.queueId === input.queueId);
      const examination: Examination = {
        id: existing?.id ?? `e-${Date.now()}`,
        patientId: input.patientId,
        queueId: input.queueId,
        dokterId: input.dokterId,
        tanggal: existing?.tanggal ?? toISODate(),
        keluhan: input.keluhan,
        pemeriksaanFisik: input.pemeriksaanFisik,
        diagnosis: input.diagnosis,
        tindakan: input.tindakan,
        catatan: input.catatan,
        rujukan: input.rujukan,
        kontrolUlang: input.kontrolUlang,
        resep: input.resep,
        resepDiserahkan: existing?.resepDiserahkan ?? false,
        status: 'selesai',
      };

      setExaminations((prev) =>
        existing
          ? prev.map((e) => (e.id === examination.id ? examination : e))
          : [...prev, examination],
      );

      setQueues((prev) =>
        prev.map((q) =>
          q.id === input.queueId ? { ...q, status: 'selesai', finishedAt: nowIso() } : q,
        ),
      );

      const billExists = bills.some((b) => b.examinationId === examination.id);
      if (!billExists) {
        const items: BillItem[] = [{ label: 'Konsultasi dokter', biaya: 15000 }];
        if (input.tindakan.trim()) {
          items.push({ label: 'Tindakan medis', biaya: 10000 });
        }
        const biayaObat = input.resep.reduce((sum, r) => {
          const medicine = medicines.find((m) => m.id === r.medicineId);
          return sum + (medicine ? medicine.harga * r.jumlah : 0);
        }, 0);
        if (biayaObat > 0) {
          items.push({ label: 'Obat & resep', biaya: biayaObat });
        }
        const bill: Bill = {
          id: `b-${Date.now()}`,
          patientId: input.patientId,
          examinationId: examination.id,
          tanggal: toISODate(),
          items,
          status: 'belum',
        };
        setBills((prev) => [...prev, bill]);
      }

      return examination;
    },
    [examinations, bills, medicines],
  );

  const dispensePrescription = useCallback(
    (examinationId: string) => {
      const examination = examinations.find((e) => e.id === examinationId);
      if (!examination || examination.resepDiserahkan) return;
      setMedicines((prev) =>
        prev.map((m) => {
          const resep = examination.resep.find((r) => r.medicineId === m.id);
          return resep ? { ...m, stok: Math.max(0, m.stok - resep.jumlah) } : m;
        }),
      );
      setExaminations((prev) =>
        prev.map((e) => (e.id === examinationId ? { ...e, resepDiserahkan: true } : e)),
      );
    },
    [examinations],
  );

  const receiveStock = useCallback((medicineId: string, qty: number) => {
    setMedicines((prev) =>
      prev.map((m) => (m.id === medicineId ? { ...m, stok: m.stok + qty } : m)),
    );
  }, []);

  const dispenseStock = useCallback((medicineId: string, qty: number) => {
    setMedicines((prev) =>
      prev.map((m) =>
        m.id === medicineId ? { ...m, stok: Math.max(0, m.stok - qty) } : m,
      ),
    );
  }, []);

  const payBill = useCallback((billId: string, metode: MetodeBayar) => {
    setBills((prev) =>
      prev.map((b) =>
        b.id === billId ? { ...b, status: 'lunas', metode, paidAt: nowIso() } : b,
      ),
    );
  }, []);

  const addUser = useCallback(
    (input: NewUser) => {
      const exists = users.some(
        (u) => u.username.toLowerCase() === input.username.trim().toLowerCase(),
      );
      if (exists) {
        return { ok: false, error: 'Username sudah digunakan.' };
      }
      const user: User = {
        id: `u-${Date.now()}`,
        username: input.username.trim(),
        password: input.password,
        name: input.name,
        role: input.role,
        poli: input.poli,
        active: true,
      };
      setUsers((prev) => [...prev, user]);
      return { ok: true };
    },
    [users],
  );

  const updateUser = useCallback((id: string, input: Partial<Omit<User, 'id'>>) => {
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, ...input } : u)));
  }, []);

  const resetPassword = useCallback((id: string) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, password: '123456' } : u)),
    );
  }, []);

  const toggleUserActive = useCallback((id: string) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, active: !u.active } : u)),
    );
  }, []);

  const value = useMemo<DataContextValue>(
    () => ({
      users,
      patients,
      queues,
      medicines,
      examinations,
      bills,
      addPatient,
      updatePatient,
      addQueue,
      updateQueueStatus,
      saveExamination,
      dispensePrescription,
      receiveStock,
      dispenseStock,
      payBill,
      addUser,
      updateUser,
      resetPassword,
      toggleUserActive,
    }),
    [
      users,
      patients,
      queues,
      medicines,
      examinations,
      bills,
      addPatient,
      updatePatient,
      addQueue,
      updateQueueStatus,
      saveExamination,
      dispensePrescription,
      receiveStock,
      dispenseStock,
      payBill,
      addUser,
      updateUser,
      resetPassword,
      toggleUserActive,
    ],
  );

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData(): DataContextValue {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData harus dipakai di dalam DataProvider');
  }
  return context;
}
