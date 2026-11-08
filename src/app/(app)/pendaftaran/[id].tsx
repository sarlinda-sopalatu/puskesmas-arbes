import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import { Page } from '@/components/page';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { Colors, Radius, Shadow } from '@/constants/theme';
import { useData } from '@/lib/data';
import {
  formatBulan,
  formatTanggal,
  formatTanggalPanjang,
  inisial,
  umur,
} from '@/lib/format';
import { QUEUE_LABEL, QUEUE_TONE } from '@/lib/ui-helpers';

export default function DetailPasienScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { patients, queues, examinations } = useData();

  const patient = patients.find((p) => p.id === id);

  if (!patient) {
    return (
      <Page title="Detail Pasien">
        <EmptyState
          icon="person-outline"
          title="Pasien tidak ditemukan"
          description="Data pasien mungkin sudah dihapus."
        />
      </Page>
    );
  }

  const riwayat = queues
    .filter((q) => q.patientId === patient.id)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  const handlePrintCard = () => {
    Alert.alert(
      'Cetak Kartu Pasien',
      `Kartu berhasil dibuat untuk ${patient.nama} (${patient.noRM}).\nPada versi produksi, kartu akan dicetak ke printer atau dibagikan sebagai PDF.`,
    );
  };

  return (
    <Page
      title="Detail Pasien"
      right={
        <Pressable
          onPress={() => router.push(`/pendaftaran/baru?id=${patient.id}` as never)}
          hitSlop={8}
          style={styles.headerButton}>
          <Ionicons name="create-outline" size={20} color={Colors.text} />
        </Pressable>
      }>
      <View style={styles.profileCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{inisial(patient.nama)}</Text>
        </View>
        <Text style={styles.name}>{patient.nama}</Text>
        <Text style={styles.rm}>{patient.noRM}</Text>
        <View style={styles.profileBadges}>
          <Badge
            label={patient.jenisKepersertaan}
            tone={patient.jenisKepersertaan === 'BPJS' ? 'info' : 'neutral'}
          />
          <Badge
            label={`${umur(patient.tanggalLahir)} tahun`}
            tone="neutral"
          />
          <Badge
            label={patient.jenisKelamin === 'L' ? 'Laki-laki' : 'Perempuan'}
            tone="purple"
          />
        </View>
      </View>

      <Card style={styles.section}>
        <Text style={styles.cardTitle}>Data Pasien</Text>
        <InfoRow label="NIK" value={patient.nik} />
        <InfoRow
          label="Tempat, Tanggal Lahir"
          value={`${patient.tempatLahir}, ${formatTanggalPanjang(patient.tanggalLahir)}`}
        />
        <InfoRow label="Alamat" value={patient.alamat} />
        <InfoRow label="No. Telepon" value={patient.noTelepon} />
        <InfoRow
          label="Kontak Keluarga"
          value={patient.kontakKeluarga || '-'}
          last
        />
      </Card>

      <View style={styles.actions}>
        <Button
          title="Cetak Kartu Pasien"
          icon="print-outline"
          onPress={handlePrintCard}
        />
      </View>

      <Card style={styles.section}>
        <View style={styles.riwayatHeader}>
          <Text style={styles.cardTitle}>Riwayat Kunjungan</Text>
          <Text style={styles.riwayatCount}>{riwayat.length} kunjungan</Text>
        </View>
        {riwayat.length === 0 ? (
          <EmptyState
            icon="calendar-outline"
            title="Belum ada riwayat"
            description="Pasien belum pernah berkunjung."
          />
        ) : (
          <View style={styles.riwayatList}>
            {riwayat.map((queue) => {
              const exam = examinations.find((e) => e.queueId === queue.id);
              const resepCount = exam?.resep.length ?? 0;
              return (
                <View key={queue.id} style={styles.riwayatItem}>
                  <View style={styles.riwayatDate}>
                    <Text style={styles.riwayatDay}>
                      {formatTanggal(queue.tanggal).split(' ')[0]}
                    </Text>
                    <Text style={styles.riwayatMonth}>
                      {formatBulan(queue.tanggal.slice(0, 7)).split(' ')[0]}
                    </Text>
                  </View>
                  <View style={styles.riwayatInfo}>
                    <Text style={styles.riwayatTitle}>
                      Poli {queue.poli} · {queue.kode}
                    </Text>
                    <Text style={styles.riwayatSubtitle} numberOfLines={1}>
                      {exam
                        ? `Diagnosis: ${exam.diagnosis}`
                        : 'Belum ada catatan pemeriksaan'}
                      {resepCount > 0 ? ` · ${resepCount} obat` : ''}
                    </Text>
                  </View>
                  <Badge
                    label={QUEUE_LABEL[queue.status]}
                    tone={QUEUE_TONE[queue.status]}
                  />
                </View>
              );
            })}
          </View>
        )}
      </Card>

      <Text style={styles.footnote}>
        Terakhir diperbarui: {formatTanggal(patient.createdAt.slice(0, 10))}
      </Text>
    </Page>
  );
}

function InfoRow({
  label,
  value,
  last,
}: {
  label: string;
  value: string;
  last?: boolean;
}) {
  return (
    <View style={[styles.infoRow, !last && styles.infoRowBorder]}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: Radius.full,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileCard: {
    backgroundColor: Colors.primaryDark,
    borderRadius: Radius.lg,
    padding: 20,
    alignItems: 'center',
    gap: 4,
    ...Shadow.card,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: Radius.full,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  avatarText: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.primaryDark,
  },
  name: {
    fontSize: 19,
    fontWeight: '800',
    color: Colors.white,
  },
  rm: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
  },
  profileBadges: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 8,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  section: {
    gap: 10,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.text,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    paddingBottom: 9,
  },
  infoRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  infoLabel: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  infoValue: {
    flex: 1,
    fontSize: 12,
    fontWeight: '600',
    color: Colors.text,
    textAlign: 'right',
  },
  actions: {
    gap: 8,
  },
  riwayatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  riwayatCount: {
    fontSize: 11,
    color: Colors.textMuted,
  },
  riwayatList: {
    gap: 10,
  },
  riwayatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: Colors.background,
    borderRadius: Radius.md,
    padding: 10,
  },
  riwayatDate: {
    width: 40,
    alignItems: 'center',
    backgroundColor: Colors.primaryLight,
    borderRadius: Radius.sm,
    paddingVertical: 6,
  },
  riwayatDay: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.primaryDark,
    lineHeight: 18,
  },
  riwayatMonth: {
    fontSize: 9,
    fontWeight: '700',
    color: Colors.primaryDark,
    textTransform: 'uppercase',
  },
  riwayatInfo: {
    flex: 1,
    gap: 2,
  },
  riwayatTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.text,
  },
  riwayatSubtitle: {
    fontSize: 10,
    color: Colors.textMuted,
  },
  footnote: {
    fontSize: 10,
    color: Colors.textMuted,
    textAlign: 'center',
  },
});
