import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';

import { Page } from '@/components/page';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Chips } from '@/components/ui/chips';
import { Input } from '@/components/ui/input';
import { Colors } from '@/constants/theme';
import { useData } from '@/lib/data';
import { POLI_LIST, ROLE_LABEL } from '@/lib/roles';
import type { Role } from '@/lib/types';

const ROLE_OPTIONS = (Object.keys(ROLE_LABEL) as Role[]).map((role) => ({
  value: role,
  label: ROLE_LABEL[role],
}));

export default function TambahPenggunaScreen() {
  const router = useRouter();
  const { addUser } = useData();
  const [nama, setNama] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<Role>('pendaftaran');
  const [poli, setPoli] = useState('Umum');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = () => {
    const next: Record<string, string> = {};
    if (!nama.trim()) next.nama = 'Nama lengkap wajib diisi.';
    if (!username.trim()) next.username = 'Username wajib diisi.';
    else if (/\s/.test(username.trim())) next.username = 'Username tanpa spasi.';
    if (password.length < 6) next.password = 'Password minimal 6 karakter.';
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    const result = addUser({
      name: nama.trim(),
      username: username.trim(),
      password,
      role,
      poli: role === 'dokter' ? poli : undefined,
    });

    if (!result.ok) {
      setErrors({ username: result.error ?? 'Username tidak valid.' });
      return;
    }

    Alert.alert(
      'Akun Dibuat',
      `Akun @${username.trim()} berhasil dibuat dengan peran ${ROLE_LABEL[role]}.`,
      [{ text: 'OK', onPress: () => router.back() }],
    );
  };

  return (
    <Page
      title="Tambah Pengguna"
      subtitle="Buat akun petugas baru"
      footer={
        <Button
          title="Simpan Pengguna"
          icon="person-add-outline"
          onPress={handleSubmit}
        />
      }>
      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>Data Akun</Text>
        <Input
          label="Nama Lengkap"
          required
          value={nama}
          onChangeText={setNama}
          placeholder="Nama petugas"
          autoCapitalize="words"
          error={errors.nama}
        />
        <Input
          label="Username"
          required
          value={username}
          onChangeText={setUsername}
          placeholder="Tanpa spasi, contoh: budi.staff"
          autoCapitalize="none"
          autoCorrect={false}
          error={errors.username}
        />
        <Input
          label="Password"
          required
          value={password}
          onChangeText={setPassword}
          placeholder="Minimal 6 karakter"
          secureTextEntry
          error={errors.password}
          helper="Pengguna dapat mengganti password setelah masuk."
        />
      </Card>

      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>Peran & Akses</Text>
        <Chips
          label="Peran"
          required
          options={ROLE_OPTIONS}
          value={role}
          onChange={(value) => setRole(value as Role)}
        />
        {role === 'dokter' ? (
          <Chips
            label="Poli"
            options={POLI_LIST.map((p) => ({
              value: p.value,
              label: p.label,
            }))}
            value={poli}
            onChange={setPoli}
          />
        ) : null}
        <View style={styles.note}>
          <Text style={styles.noteText}>
            Hak akses modul akan mengikuti peran yang dipilih. Administrator
            dapat mengubah status akun kapan saja.
          </Text>
        </View>
      </Card>
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
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 12,
  },
  noteText: {
    fontSize: 11,
    color: Colors.textMuted,
    lineHeight: 16,
  },
});
