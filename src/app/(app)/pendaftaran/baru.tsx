import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';

import { Page } from '@/components/page';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Chips } from '@/components/ui/chips';
import { Input } from '@/components/ui/input';
import { Colors } from '@/constants/theme';
import { useData } from '@/lib/data';
import { parseISODate } from '@/lib/format';
import type { JenisKelamin, JenisKepersertaan } from '@/lib/types';

type Errors = Record<string, string>;

export default function FormPasienScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const router = useRouter();
  const { patients, addPatient, updatePatient } = useData();
  const existing = id ? patients.find((p) => p.id === id) : undefined;

  const [nik, setNik] = useState(existing?.nik ?? '');
  const [nama, setNama] = useState(existing?.nama ?? '');
  const [tempatLahir, setTempatLahir] = useState(existing?.tempatLahir ?? '');
  const [tanggalLahir, setTanggalLahir] = useState(existing?.tanggalLahir ?? '');
  const [jenisKelamin, setJenisKelamin] = useState<JenisKelamin>(
    existing?.jenisKelamin ?? 'L',
  );
  const [alamat, setAlamat] = useState(existing?.alamat ?? '');
  const [noTelepon, setNoTelepon] = useState(existing?.noTelepon ?? '');
  const [jenisKepersertaan, setJenisKepersertaan] = useState<JenisKepersertaan>(
    existing?.jenisKepersertaan ?? 'BPJS',
  );
  const [kontakKeluarga, setKontakKeluarga] = useState(
    existing?.kontakKeluarga ?? '',
  );
  const [errors, setErrors] = useState<Errors>({});

  const validate = (): boolean => {
    const next: Errors = {};
    const nikValue = nik.trim();

    if (!/^\d{16}$/.test(nikValue)) {
      next.nik = 'NIK harus terdiri dari 16 digit angka.';
    } else if (
      patients.some((p) => p.nik === nikValue && p.id !== existing?.id)
    ) {
      next.nik = 'NIK sudah terdaftar pada pasien lain.';
    }
    if (!nama.trim()) next.nama = 'Nama lengkap wajib diisi.';
    if (!tempatLahir.trim()) next.tempatLahir = 'Tempat lahir wajib diisi.';
    if (!/^\d{4}-\d{2}-\d{2}$/.test(tanggalLahir) || !parseISODate(tanggalLahir)) {
      next.tanggalLahir = 'Gunakan format YYYY-MM-DD, contoh 1999-01-31.';
    }
    if (!alamat.trim()) next.alamat = 'Alamat wajib diisi.';
    if (!noTelepon.trim()) next.noTelepon = 'Nomor telepon wajib diisi.';

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) {
      Alert.alert('Data belum lengkap', 'Periksa kembali kolom yang ditandai merah.');
      return;
    }

    const payload = {
      nik: nik.trim(),
      nama: nama.trim(),
      tempatLahir: tempatLahir.trim(),
      tanggalLahir,
      jenisKelamin,
      alamat: alamat.trim(),
      noTelepon: noTelepon.trim(),
      jenisKepersertaan,
      kontakKeluarga: kontakKeluarga.trim() || undefined,
    };

    if (existing) {
      updatePatient(existing.id, payload);
      Alert.alert('Data Diperbarui', 'Perubahan data pasien berhasil disimpan.', [
        {
          text: 'OK',
          onPress: () => router.replace(`/pendaftaran/${existing.id}` as never),
        },
      ]);
      return;
    }

    const patient = addPatient(payload);
    Alert.alert(
      'Pasien Terdaftar',
      `${patient.nama} berhasil didaftarkan.\nNomor Rekam Medis: ${patient.noRM}`,
      [
        {
          text: 'Lihat Detail',
          onPress: () => router.replace(`/pendaftaran/${patient.id}` as never),
        },
      ],
    );
  };

  return (
    <Page
      title={existing ? 'Ubah Data Pasien' : 'Registrasi Pasien Baru'}
      subtitle="Lengkapi data identitas dan kontak"
      footer={
        <Button
          title={existing ? 'Simpan Perubahan' : 'Simpan & Daftarkan'}
          icon="save-outline"
          onPress={handleSubmit}
        />
      }>
      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>Data Identitas</Text>
        <Input
          label="NIK"
          required
          value={nik}
          onChangeText={setNik}
          placeholder="16 digit NIK"
          keyboardType="number-pad"
          maxLength={16}
          error={errors.nik}
          helper="NIK akan divalidasi otomatis (16 digit)."
        />
        <Input
          label="Nama Lengkap"
          required
          value={nama}
          onChangeText={setNama}
          placeholder="Sesuai KTP"
          autoCapitalize="words"
          error={errors.nama}
        />
        <Input
          label="Tempat Lahir"
          required
          value={tempatLahir}
          onChangeText={setTempatLahir}
          placeholder="Contoh: Bandung"
          autoCapitalize="words"
          error={errors.tempatLahir}
        />
        <Input
          label="Tanggal Lahir"
          required
          value={tanggalLahir}
          onChangeText={setTanggalLahir}
          placeholder="YYYY-MM-DD"
          keyboardType="numbers-and-punctuation"
          error={errors.tanggalLahir}
          helper="Contoh: 1999-01-31"
        />
        <Chips
          label="Jenis Kelamin"
          required
          value={jenisKelamin}
          onChange={(value) => setJenisKelamin(value as JenisKelamin)}
          options={[
            { value: 'L', label: 'Laki-laki' },
            { value: 'P', label: 'Perempuan' },
          ]}
        />
      </Card>

      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>Alamat & Kontak</Text>
        <Input
          label="Alamat Lengkap"
          required
          value={alamat}
          onChangeText={setAlamat}
          placeholder="Jalan, nomor rumah, kelurahan, kota"
          multiline
          error={errors.alamat}
        />
        <Input
          label="Nomor Telepon"
          required
          value={noTelepon}
          onChangeText={setNoTelepon}
          placeholder="08xxxxxxxxxx"
          keyboardType="phone-pad"
          error={errors.noTelepon}
        />
        <Chips
          label="Jenis Kepesertaan"
          required
          value={jenisKepersertaan}
          onChange={(value) =>
            setJenisKepersertaan(value as JenisKepersertaan)
          }
          options={[
            { value: 'BPJS', label: 'BPJS' },
            { value: 'Umum', label: 'Umum' },
          ]}
        />
        <Input
          label="Kontak Keluarga"
          value={kontakKeluarga}
          onChangeText={setKontakKeluarga}
          placeholder="Nama dan nomor telepon keluarga"
          helper="Opsional, digunakan untuk kondisi darurat."
        />
      </Card>

      <View style={styles.note}>
        <Text style={styles.noteText}>
          Nomor Rekam Medis akan dibuat otomatis setelah data disimpan.
        </Text>
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
  note: {
    backgroundColor: Colors.primarySoft,
    borderRadius: 12,
    padding: 12,
  },
  noteText: {
    fontSize: 11,
    color: Colors.textSecondary,
    lineHeight: 16,
  },
});
