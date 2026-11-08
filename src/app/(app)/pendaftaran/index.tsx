import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Page } from '@/components/page';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { SearchInput } from '@/components/ui/search-input';
import { Colors, Radius, Shadow } from '@/constants/theme';
import { useData } from '@/lib/data';
import { inisial, maskNik, umur } from '@/lib/format';

export default function PendaftaranScreen() {
  const router = useRouter();
  const { patients } = useData();
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return patients;
    return patients.filter(
      (p) =>
        p.nama.toLowerCase().includes(query) ||
        p.nik.includes(query) ||
        p.noRM.toLowerCase().includes(query),
    );
  }, [patients, search]);

  const bpjsCount = patients.filter((p) => p.jenisKepersertaan === 'BPJS').length;
  const umumCount = patients.length - bpjsCount;

  return (
    <Page
      title="Pendaftaran Pasien"
      subtitle={`${patients.length} pasien terdaftar`}
      right={
        <Pressable
          onPress={() => router.push('/pendaftaran/baru')}
          hitSlop={8}
          style={styles.headerButton}>
          <Ionicons name="add" size={22} color={Colors.white} />
        </Pressable>
      }
      footer={
        <Button
          title="Daftarkan Pasien Baru"
          icon="person-add-outline"
          onPress={() => router.push('/pendaftaran/baru')}
        />
      }>
      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{patients.length}</Text>
          <Text style={styles.statLabel}>Total Pasien</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{bpjsCount}</Text>
          <Text style={styles.statLabel}>BPJS</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{umumCount}</Text>
          <Text style={styles.statLabel}>Umum</Text>
        </View>
      </View>

      <SearchInput
        value={search}
        onChangeText={setSearch}
        placeholder="Cari nama, NIK, atau No. RM"
      />

      {filtered.length === 0 ? (
        <EmptyState
          icon="person-outline"
          title="Pasien tidak ditemukan"
          description="Coba kata kunci lain atau daftarkan pasien baru."
        />
      ) : (
        <View style={styles.list}>
          {filtered.map((patient) => (
            <Pressable
              key={patient.id}
              onPress={() => router.push(`/pendaftaran/${patient.id}` as never)}
              style={({ pressed }) => [styles.patientCard, pressed && styles.pressed]}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{inisial(patient.nama)}</Text>
              </View>
              <View style={styles.info}>
                <Text style={styles.name} numberOfLines={1}>
                  {patient.nama}
                </Text>
                <Text style={styles.meta} numberOfLines={1}>
                  {patient.noRM} · {umur(patient.tanggalLahir)} thn ·{' '}
                  {patient.jenisKelamin === 'L' ? 'Laki-laki' : 'Perempuan'}
                </Text>
                <View style={styles.badges}>
                  <Badge
                    label={patient.jenisKepersertaan}
                    tone={patient.jenisKepersertaan === 'BPJS' ? 'info' : 'neutral'}
                  />
                  <Text style={styles.nik}>NIK {maskNik(patient.nik)}</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
            </Pressable>
          ))}
        </View>
      )}
    </Page>
  );
}

const styles = StyleSheet.create({
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: Radius.full,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  statBox: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingVertical: 12,
    alignItems: 'center',
    gap: 2,
    ...Shadow.card,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.primaryDark,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textMuted,
  },
  list: {
    gap: 8,
  },
  patientCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 12,
  },
  avatar: {
    width: 42,
    height: 42,
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
  info: {
    flex: 1,
    gap: 2,
  },
  name: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.text,
  },
  meta: {
    fontSize: 11,
    color: Colors.textMuted,
  },
  badges: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  nik: {
    fontSize: 10,
    color: Colors.textMuted,
  },
  pressed: {
    opacity: 0.8,
  },
});
