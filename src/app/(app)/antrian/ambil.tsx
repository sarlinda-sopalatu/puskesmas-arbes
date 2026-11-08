import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Alert, Pressable, StyleSheet, Switch, Text, View } from 'react-native';

import { Page } from '@/components/page';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Chips } from '@/components/ui/chips';
import { SearchInput } from '@/components/ui/search-input';
import { Colors, Radius } from '@/constants/theme';
import { useData } from '@/lib/data';
import { inisial, maskNik, toISODate } from '@/lib/format';
import { POLI_LIST } from '@/lib/roles';

const ALASAN_PRIORITAS = [
  { value: 'Lansia', label: 'Lansia' },
  { value: 'Ibu Hamil', label: 'Ibu Hamil' },
  { value: 'Anak', label: 'Anak' },
  { value: 'Disabilitas', label: 'Disabilitas' },
  { value: 'Darurat', label: 'Darurat' },
];

export default function AmbilAntreanScreen() {
  const router = useRouter();
  const { patients, queues, addQueue } = useData();
  const [search, setSearch] = useState('');
  const [patientId, setPatientId] = useState<string | null>(null);
  const [poli, setPoli] = useState('Umum');
  const [priority, setPriority] = useState(false);
  const [alasan, setAlasan] = useState('Lansia');

  const today = toISODate();
  const filteredPatients = useMemo(() => {
    const query = search.trim().toLowerCase();
    const list = query
      ? patients.filter(
          (p) =>
            p.nama.toLowerCase().includes(query) ||
            p.nik.includes(query) ||
            p.noRM.toLowerCase().includes(query),
        )
      : patients;
    return list.slice(0, 6);
  }, [patients, search]);

  const waitingCount = queues.filter(
    (q) => q.tanggal === today && q.poli === poli && q.status === 'menunggu',
  ).length;
  const estimasi = (waitingCount + 1) * 15;
  const selectedPatient = patients.find((p) => p.id === patientId);

  const handleSubmit = () => {
    if (!selectedPatient) {
      Alert.alert('Pasien belum dipilih', 'Pilih pasien terlebih dahulu.');
      return;
    }
    const ticket = addQueue({
      patientId: selectedPatient.id,
      poli,
      priority,
      alasanPrioritas: priority ? alasan : undefined,
    });
    Alert.alert(
      'Nomor Antrean Diterbitkan',
      `${ticket.kode} untuk ${selectedPatient.nama} (Poli ${ticket.poli}).\nEstimasi dipanggil ± ${ticket.estimasiMenit} menit.`,
      [
        {
          text: 'Lihat Tiket',
          onPress: () => router.replace(`/antrian/${ticket.id}` as never),
        },
      ],
    );
  };

  return (
    <Page
      title="Ambil Antrean"
      subtitle="Pilih pasien dan poli tujuan"
      footer={<Button title="Ambil Nomor Antrean" icon="ticket-outline" onPress={handleSubmit} />}>
      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>1. Pilih Pasien</Text>
        <SearchInput
          value={search}
          onChangeText={setSearch}
          placeholder="Cari nama, NIK, atau No. RM"
        />
        <View style={styles.patientList}>
          {filteredPatients.map((patient) => {
            const selected = patient.id === patientId;
            return (
              <Pressable
                key={patient.id}
                onPress={() => setPatientId(patient.id)}
                style={[styles.patientCard, selected && styles.patientCardActive]}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{inisial(patient.nama)}</Text>
                </View>
                <View style={styles.patientInfo}>
                  <Text style={styles.patientName}>{patient.nama}</Text>
                  <Text style={styles.patientMeta}>
                    {patient.noRM} · NIK {maskNik(patient.nik)}
                  </Text>
                </View>
                <Ionicons
                  name={selected ? 'checkmark-circle' : 'ellipse-outline'}
                  size={22}
                  color={selected ? Colors.primary : Colors.borderStrong}
                />
              </Pressable>
            );
          })}
          {filteredPatients.length === 0 ? (
            <Text style={styles.helper}>
              Pasien tidak ditemukan. Daftarkan pasien baru melalui menu Pendaftaran.
            </Text>
          ) : null}
        </View>
      </Card>

      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>2. Pilih Poli</Text>
        <View style={styles.poliGrid}>
          {POLI_LIST.map((item) => {
            const selected = item.value === poli;
            return (
              <Pressable
                key={item.value}
                onPress={() => setPoli(item.value)}
                style={[styles.poliCard, selected && styles.poliCardActive]}>
                <View style={[styles.poliIcon, { backgroundColor: item.bg }]}>
                  <Ionicons name={item.icon} size={20} color={item.color} />
                </View>
                <Text
                  style={[styles.poliLabel, selected && styles.poliLabelActive]}
                  numberOfLines={2}>
                  {item.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </Card>

      <Card style={styles.section}>
        <View style={styles.priorityRow}>
          <View style={styles.priorityInfo}>
            <Text style={styles.sectionTitle}>Antrean Prioritas</Text>
            <Text style={styles.helper}>
              Untuk lansia, ibu hamil, anak, disabilitas, atau kondisi darurat.
            </Text>
          </View>
          <Switch
            value={priority}
            onValueChange={setPriority}
            trackColor={{ false: Colors.border, true: Colors.primaryLight }}
            thumbColor={priority ? Colors.primary : Colors.surface}
          />
        </View>
        {priority ? (
          <Chips
            options={ALASAN_PRIORITAS}
            value={alasan}
            onChange={setAlasan}
            label="Alasan prioritas"
          />
        ) : null}
      </Card>

      <View style={styles.estimasiCard}>
        <Ionicons name="time-outline" size={20} color={Colors.primaryDark} />
        <View style={styles.estimasiInfo}>
          <Text style={styles.estimasiTitle}>Estimasi waktu tunggu</Text>
          <Text style={styles.estimasiText}>
            ± {estimasi} menit untuk Poli {poli}
            {waitingCount > 0 ? ` · ${waitingCount} antrean di depan` : ''}
          </Text>
        </View>
      </View>
    </Page>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.text,
  },
  patientList: {
    gap: 8,
  },
  patientCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    padding: 10,
  },
  patientCardActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primarySoft,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: Radius.full,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.primaryDark,
  },
  patientInfo: {
    flex: 1,
    gap: 1,
  },
  patientName: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.text,
  },
  patientMeta: {
    fontSize: 11,
    color: Colors.textMuted,
  },
  helper: {
    fontSize: 11,
    color: Colors.textMuted,
    lineHeight: 16,
  },
  poliGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  poliCard: {
    width: '31%',
    flexGrow: 1,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    paddingVertical: 10,
    paddingHorizontal: 6,
    alignItems: 'center',
    gap: 6,
  },
  poliCardActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primarySoft,
  },
  poliIcon: {
    width: 36,
    height: 36,
    borderRadius: Radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  poliLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  poliLabelActive: {
    color: Colors.primaryDark,
    fontWeight: '800',
  },
  priorityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  priorityInfo: {
    flex: 1,
    gap: 2,
  },
  estimasiCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: Colors.primaryLight,
    borderRadius: Radius.md,
    padding: 12,
  },
  estimasiInfo: {
    flex: 1,
    gap: 1,
  },
  estimasiTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.primaryDark,
  },
  estimasiText: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
});
