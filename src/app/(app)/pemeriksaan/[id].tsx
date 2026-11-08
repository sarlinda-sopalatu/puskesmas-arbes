import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import { Page } from '@/components/page';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Chips } from '@/components/ui/chips';
import { EmptyState } from '@/components/ui/empty-state';
import { Input } from '@/components/ui/input';
import { Colors, Radius } from '@/constants/theme';
import { useAuth } from '@/lib/auth';
import { useData } from '@/lib/data';
import {
  formatRupiah,
  formatTanggal,
  inisial,
  toISODate,
  umur,
} from '@/lib/format';
import type { ResepItem } from '@/lib/types';

const KONTROL_OPTIONS = [
  { value: '0', label: 'Tidak perlu' },
  { value: '7', label: '7 hari' },
  { value: '14', label: '14 hari' },
  { value: '30', label: '30 hari' },
];

export default function FormPemeriksaanScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const { queues, patients, medicines, examinations, saveExamination } =
    useData();

  const queue = queues.find((q) => q.id === id);
  const patient = queue ? patients.find((p) => p.id === queue.patientId) : undefined;
  const existing = examinations.find((e) => e.queueId === id);

  const [keluhan, setKeluhan] = useState(existing?.keluhan ?? '');
  const [tekananDarah, setTekananDarah] = useState(
    existing?.pemeriksaanFisik.tekananDarah ?? '',
  );
  const [nadi, setNadi] = useState(existing?.pemeriksaanFisik.nadi ?? '');
  const [suhu, setSuhu] = useState(existing?.pemeriksaanFisik.suhu ?? '');
  const [respirasi, setRespirasi] = useState(
    existing?.pemeriksaanFisik.respirasi ?? '',
  );
  const [beratBadan, setBeratBadan] = useState(
    existing?.pemeriksaanFisik.beratBadan ?? '',
  );
  const [tinggiBadan, setTinggiBadan] = useState(
    existing?.pemeriksaanFisik.tinggiBadan ?? '',
  );
  const [diagnosis, setDiagnosis] = useState(existing?.diagnosis ?? '');
  const [tindakan, setTindakan] = useState(existing?.tindakan ?? '');
  const [catatan, setCatatan] = useState(existing?.catatan ?? '');
  const [rujukan, setRujukan] = useState(existing?.rujukan ?? '');
  const [kontrolUlang, setKontrolUlang] = useState(existing?.kontrolUlang ?? '');
  const [resep, setResep] = useState<ResepItem[]>(existing?.resep ?? []);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!queue || !patient) {
    return (
      <Page title="Pemeriksaan">
        <EmptyState
          icon="medkit-outline"
          title="Data tidak ditemukan"
          description="Antrean pasien tidak tersedia."
        />
      </Page>
    );
  }

  const kontrolValue = (() => {
    if (!kontrolUlang) return '0';
    const diff = Math.round(
      (new Date(`${kontrolUlang}T00:00:00`).getTime() -
        new Date(`${toISODate()}T00:00:00`).getTime()) /
        86400000,
    );
    return [7, 14, 30].includes(diff) ? String(diff) : '';
  })();

  const handleKontrol = (value: string) => {
    if (value === '0') {
      setKontrolUlang('');
      return;
    }
    const date = new Date();
    date.setDate(date.getDate() + Number(value));
    setKontrolUlang(toISODate(date));
  };

  const addMedicine = (medicineId: string) => {
    setResep((prev) =>
      prev.some((r) => r.medicineId === medicineId)
        ? prev
        : [...prev, { medicineId, jumlah: 10, aturan: '3x1 sesudah makan' }],
    );
    setPickerOpen(false);
  };

  const updateQty = (medicineId: string, delta: number) => {
    setResep((prev) =>
      prev.map((r) =>
        r.medicineId === medicineId
          ? { ...r, jumlah: Math.max(1, r.jumlah + delta) }
          : r,
      ),
    );
  };

  const updateAturan = (medicineId: string, aturan: string) => {
    setResep((prev) =>
      prev.map((r) => (r.medicineId === medicineId ? { ...r, aturan } : r)),
    );
  };

  const removeMedicine = (medicineId: string) => {
    setResep((prev) => prev.filter((r) => r.medicineId !== medicineId));
  };

  const handleSave = () => {
    const next: Record<string, string> = {};
    if (!keluhan.trim()) next.keluhan = 'Keluhan wajib diisi.';
    if (!diagnosis.trim()) next.diagnosis = 'Diagnosis wajib diisi.';
    setErrors(next);
    if (Object.keys(next).length > 0) {
      Alert.alert('Data belum lengkap', 'Keluhan dan diagnosis wajib diisi.');
      return;
    }

    saveExamination({
      queueId: queue.id,
      patientId: patient.id,
      dokterId: user?.id ?? 'u-3',
      keluhan: keluhan.trim(),
      pemeriksaanFisik: {
        tekananDarah: tekananDarah.trim(),
        nadi: nadi.trim(),
        suhu: suhu.trim(),
        respirasi: respirasi.trim(),
        beratBadan: beratBadan.trim(),
        tinggiBadan: tinggiBadan.trim(),
      },
      diagnosis: diagnosis.trim(),
      tindakan: tindakan.trim(),
      catatan: catatan.trim(),
      rujukan: rujukan.trim(),
      kontrolUlang,
      resep,
    });

    Alert.alert(
      'Pemeriksaan Disimpan',
      'Rekam medis elektronik berhasil disimpan dan antrean ditandai selesai.',
      [{ text: 'OK', onPress: () => router.back() }],
    );
  };

  const availableMedicines = medicines.filter(
    (m) => !resep.some((r) => r.medicineId === m.id),
  );

  return (
    <Page
      title={existing ? 'Rekam Medis Elektronik' : 'Pemeriksaan Pasien'}
      subtitle={`${queue.kode} · Poli ${queue.poli}`}
      footer={
        <Button
          title="Simpan Pemeriksaan"
          icon="save-outline"
          onPress={handleSave}
        />
      }>
      {existing ? (
        <View style={styles.editBanner}>
          <Ionicons name="information-circle" size={18} color={Colors.info} />
          <Text style={styles.editBannerText}>
            EMR sudah tersimpan. Perubahan akan memperbarui data sebelumnya.
          </Text>
        </View>
      ) : null}

      <Card style={styles.patientCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{inisial(patient.nama)}</Text>
        </View>
        <View style={styles.patientInfo}>
          <Text style={styles.patientName}>{patient.nama}</Text>
          <Text style={styles.patientMeta}>
            {patient.noRM} · {umur(patient.tanggalLahir)} thn ·{' '}
            {patient.jenisKelamin === 'L' ? 'Laki-laki' : 'Perempuan'}
          </Text>
        </View>
        <Badge
          label={patient.jenisKepersertaan}
          tone={patient.jenisKepersertaan === 'BPJS' ? 'info' : 'neutral'}
        />
      </Card>

      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>Keluhan & Anamnesis</Text>
        <Input
          label="Keluhan utama"
          required
          value={keluhan}
          onChangeText={setKeluhan}
          placeholder="Deskripsikan keluhan pasien"
          multiline
          error={errors.keluhan}
        />
      </Card>

      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>Pemeriksaan Fisik</Text>
        <View style={styles.row2}>
          <View style={styles.col}>
            <Input
              label="Tekanan darah"
              value={tekananDarah}
              onChangeText={setTekananDarah}
              placeholder="120/80 mmHg"
            />
          </View>
          <View style={styles.col}>
            <Input
              label="Nadi"
              value={nadi}
              onChangeText={setNadi}
              placeholder="80 x/menit"
            />
          </View>
        </View>
        <View style={styles.row2}>
          <View style={styles.col}>
            <Input
              label="Suhu"
              value={suhu}
              onChangeText={setSuhu}
              placeholder="36,5 °C"
            />
          </View>
          <View style={styles.col}>
            <Input
              label="Respirasi"
              value={respirasi}
              onChangeText={setRespirasi}
              placeholder="18 x/menit"
            />
          </View>
        </View>
        <View style={styles.row2}>
          <View style={styles.col}>
            <Input
              label="Berat badan"
              value={beratBadan}
              onChangeText={setBeratBadan}
              placeholder="kg"
              keyboardType="numeric"
            />
          </View>
          <View style={styles.col}>
            <Input
              label="Tinggi badan"
              value={tinggiBadan}
              onChangeText={setTinggiBadan}
              placeholder="cm"
              keyboardType="numeric"
            />
          </View>
        </View>
      </Card>

      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>Diagnosis & Tindakan</Text>
        <Input
          label="Diagnosis"
          required
          value={diagnosis}
          onChangeText={setDiagnosis}
          placeholder="Contoh: ISPA ringan"
          error={errors.diagnosis}
        />
        <Input
          label="Tindakan medis"
          value={tindakan}
          onChangeText={setTindakan}
          placeholder="Tindakan yang diberikan"
          multiline
        />
        <Input
          label="Catatan dokter"
          value={catatan}
          onChangeText={setCatatan}
          placeholder="Catatan tambahan"
          multiline
        />
      </Card>

      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>Rujukan & Kontrol Ulang</Text>
        <Input
          label="Rujukan"
          value={rujukan}
          onChangeText={setRujukan}
          placeholder="Tujuan rujukan (opsional)"
        />
        <Chips
          label="Kontrol ulang"
          options={KONTROL_OPTIONS}
          value={kontrolValue}
          onChange={handleKontrol}
        />
        {kontrolUlang ? (
          <Text style={styles.helper}>
            Tanggal kontrol: {formatTanggal(kontrolUlang)}
          </Text>
        ) : null}
      </Card>

      <Card style={styles.section}>
        <View style={styles.resepHeader}>
          <Text style={styles.sectionTitle}>Resep Elektronik</Text>
          <Pressable
            onPress={() => setPickerOpen((open) => !open)}
            hitSlop={8}
            style={styles.addResepButton}>
            <Ionicons
              name={pickerOpen ? 'close' : 'add'}
              size={18}
              color={Colors.primaryDark}
            />
            <Text style={styles.addResepText}>
              {pickerOpen ? 'Tutup' : 'Tambah Obat'}
            </Text>
          </Pressable>
        </View>

        {resep.length === 0 ? (
          <Text style={styles.helper}>
            Belum ada obat diresepkan. Ketuk &ldquo;Tambah Obat&rdquo; untuk memilih obat.
          </Text>
        ) : (
          <View style={styles.resepList}>
            {resep.map((item) => {
              const medicine = medicines.find((m) => m.id === item.medicineId);
              if (!medicine) return null;
              return (
                <View key={item.medicineId} style={styles.resepItem}>
                  <View style={styles.resepInfo}>
                    <Text style={styles.resepName}>{medicine.nama}</Text>
                    <Text style={styles.resepMeta}>
                      {formatRupiah(medicine.harga)} / {medicine.satuan} · stok{' '}
                      {medicine.stok}
                    </Text>
                    <Input
                      value={item.aturan}
                      onChangeText={(value) =>
                        updateAturan(item.medicineId, value)
                      }
                      placeholder="Aturan pakai"
                    />
                  </View>
                  <View style={styles.resepActions}>
                    <View style={styles.qtyRow}>
                      <Pressable
                        onPress={() => updateQty(item.medicineId, -1)}
                        style={styles.qtyButton}>
                        <Ionicons name="remove" size={16} color={Colors.text} />
                      </Pressable>
                      <Text style={styles.qtyValue}>{item.jumlah}</Text>
                      <Pressable
                        onPress={() => updateQty(item.medicineId, 1)}
                        style={styles.qtyButton}>
                        <Ionicons name="add" size={16} color={Colors.text} />
                      </Pressable>
                    </View>
                    <Pressable
                      onPress={() => removeMedicine(item.medicineId)}
                      hitSlop={6}>
                      <Ionicons
                        name="trash-outline"
                        size={18}
                        color={Colors.danger}
                      />
                    </Pressable>
                  </View>
                </View>
              );
            })}
          </View>
        )}

        {pickerOpen ? (
          <View style={styles.picker}>
            {availableMedicines.length === 0 ? (
              <Text style={styles.helper}>Semua obat sudah dipilih.</Text>
            ) : (
              availableMedicines.map((medicine) => (
                <Pressable
                  key={medicine.id}
                  onPress={() => addMedicine(medicine.id)}
                  style={styles.pickerItem}>
                  <View style={styles.pickerIcon}>
                    <Ionicons
                      name="flask-outline"
                      size={16}
                      color={Colors.cyan}
                    />
                  </View>
                  <View style={styles.pickerInfo}>
                    <Text style={styles.pickerName}>{medicine.nama}</Text>
                    <Text style={styles.pickerMeta}>
                      Stok {medicine.stok} {medicine.satuan} ·{' '}
                      {formatRupiah(medicine.harga)}
                    </Text>
                  </View>
                  <Ionicons
                    name="add-circle"
                    size={22}
                    color={Colors.primary}
                  />
                </Pressable>
              ))
            )}
          </View>
        ) : null}
      </Card>
    </Page>
  );
}

const styles = StyleSheet.create({
  editBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.infoLight,
    borderRadius: Radius.md,
    padding: 12,
  },
  editBannerText: {
    flex: 1,
    fontSize: 11,
    color: Colors.info,
    fontWeight: '600',
  },
  patientCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: Radius.full,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.primaryDark,
  },
  patientInfo: {
    flex: 1,
    gap: 2,
  },
  patientName: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text,
  },
  patientMeta: {
    fontSize: 11,
    color: Colors.textMuted,
  },
  section: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.text,
  },
  row2: {
    flexDirection: 'row',
    gap: 10,
  },
  col: {
    flex: 1,
  },
  helper: {
    fontSize: 11,
    color: Colors.textMuted,
    lineHeight: 16,
  },
  resepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  addResepButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: Colors.primaryLight,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: Radius.full,
  },
  addResepText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.primaryDark,
  },
  resepList: {
    gap: 10,
  },
  resepItem: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    padding: 10,
    gap: 8,
  },
  resepInfo: {
    gap: 3,
  },
  resepName: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.text,
  },
  resepMeta: {
    fontSize: 10,
    color: Colors.textMuted,
    marginBottom: 4,
  },
  resepActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  qtyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  qtyButton: {
    width: 30,
    height: 30,
    borderRadius: Radius.sm,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyValue: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.text,
    minWidth: 24,
    textAlign: 'center',
  },
  picker: {
    gap: 6,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: 10,
  },
  pickerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: Colors.background,
    borderRadius: Radius.md,
    padding: 10,
  },
  pickerIcon: {
    width: 32,
    height: 32,
    borderRadius: Radius.sm,
    backgroundColor: Colors.cyanLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pickerInfo: {
    flex: 1,
    gap: 1,
  },
  pickerName: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.text,
  },
  pickerMeta: {
    fontSize: 10,
    color: Colors.textMuted,
  },
});
