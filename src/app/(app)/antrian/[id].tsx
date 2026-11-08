import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import { Alert, StyleSheet, Text, View } from 'react-native';

import { Page } from '@/components/page';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { Colors, Radius, Shadow } from '@/constants/theme';
import { useAuth } from '@/lib/auth';
import { useData } from '@/lib/data';
import { formatJam, umur } from '@/lib/format';
import { QUEUE_LABEL, QUEUE_TONE } from '@/lib/ui-helpers';

export default function DetailAntreanScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const { queues, patients, updateQueueStatus } = useData();

  const queue = queues.find((q) => q.id === id);
  const patient = queue ? patients.find((p) => p.id === queue.patientId) : undefined;

  if (!queue) {
    return (
      <Page title="Detail Antrean">
        <EmptyState
          icon="ticket-outline"
          title="Antrean tidak ditemukan"
          description="Data antrean mungkin sudah dihapus atau tidak tersedia."
        />
      </Page>
    );
  }

  const canManage =
    user !== null && ['admin', 'pendaftaran', 'dokter', 'perawat'].includes(user.role);

  const handleCall = () =>
    Alert.alert('Panggil Antrean', `Panggil ${queue.kode}?`, [
      { text: 'Batal', style: 'cancel' },
      {
        text: 'Panggil',
        onPress: () => updateQueueStatus(queue.id, 'dipanggil'),
      },
    ]);

  const handleFinish = () =>
    Alert.alert('Selesaikan Antrean', `Tandai ${queue.kode} sebagai selesai?`, [
      { text: 'Batal', style: 'cancel' },
      {
        text: 'Selesai',
        onPress: () => updateQueueStatus(queue.id, 'selesai'),
      },
    ]);

  const handleCancel = () =>
    Alert.alert('Batalkan Antrean', `Batalkan antrean ${queue.kode}?`, [
      { text: 'Tidak', style: 'cancel' },
      {
        text: 'Batalkan',
        style: 'destructive',
        onPress: () => updateQueueStatus(queue.id, 'batal'),
      },
    ]);

  const footer = canManage ? (
    <View style={styles.footerButtons}>
      {queue.status === 'menunggu' ? (
        <Button title="Panggil Antrean" icon="megaphone-outline" onPress={handleCall} />
      ) : null}
      {queue.status === 'dipanggil' ? (
        <Button title="Tandai Selesai" icon="checkmark-outline" onPress={handleFinish} />
      ) : null}
      {queue.status === 'menunggu' || queue.status === 'dipanggil' ? (
        <Button title="Batalkan Antrean" variant="secondary" onPress={handleCancel} />
      ) : null}
    </View>
  ) : undefined;

  return (
    <Page title="Detail Antrean" footer={footer}>
      <View style={styles.ticket}>
        <View style={styles.ticketTop}>
          <View>
            <Text style={styles.ticketLabel}>NOMOR ANTREAN</Text>
            <Text style={styles.ticketCode}>{queue.kode}</Text>
          </View>
          <Badge label={QUEUE_LABEL[queue.status]} tone={QUEUE_TONE[queue.status]} />
        </View>
        <View style={styles.dashed} />
        <View style={styles.ticketBottom}>
          <View style={styles.ticketCol}>
            <Text style={styles.ticketMetaLabel}>POLI</Text>
            <Text style={styles.ticketMetaValue}>{queue.poli}</Text>
          </View>
          <View style={styles.ticketCol}>
            <Text style={styles.ticketMetaLabel}>ESTIMASI</Text>
            <Text style={styles.ticketMetaValue}>
              {queue.status === 'selesai' ? 'Selesai' : `${queue.estimasiMenit} menit`}
            </Text>
          </View>
          <View style={styles.ticketCol}>
            <Text style={styles.ticketMetaLabel}>AMBIL</Text>
            <Text style={styles.ticketMetaValue}>{formatJam(queue.createdAt)}</Text>
          </View>
        </View>
      </View>

      {queue.priority ? (
        <View style={styles.priorityBanner}>
          <Ionicons name="alert-circle" size={18} color={Colors.danger} />
          <Text style={styles.priorityText}>
            Antrean prioritas{queue.alasanPrioritas ? ` · ${queue.alasanPrioritas}` : ''}
          </Text>
        </View>
      ) : null}

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Informasi Pasien</Text>
        <InfoRow label="Nama" value={patient?.nama ?? '-'} />
        <InfoRow label="No. Rekam Medis" value={patient?.noRM ?? '-'} />
        <InfoRow label="NIK" value={patient?.nik ?? '-'} />
        <InfoRow
          label="Usia / Jenis Kelamin"
          value={
            patient
              ? `${umur(patient.tanggalLahir)} tahun · ${
                  patient.jenisKelamin === 'L' ? 'Laki-laki' : 'Perempuan'
                }`
              : '-'
          }
        />
        <InfoRow
          label="Kepesertaan"
          value={patient?.jenisKepersertaan ?? '-'}
          last
        />
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Status Antrean</Text>
        <InfoRow label="Status" value={QUEUE_LABEL[queue.status]} />
        <InfoRow label="Waktu dipanggil" value={formatJam(queue.calledAt)} />
        <InfoRow label="Waktu selesai" value={formatJam(queue.finishedAt)} last />
      </View>
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
  ticket: {
    backgroundColor: Colors.primaryDark,
    borderRadius: Radius.lg,
    padding: 18,
    gap: 14,
    ...Shadow.card,
  },
  ticketTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  ticketLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.2,
    color: 'rgba(255,255,255,0.65)',
  },
  ticketCode: {
    fontSize: 46,
    fontWeight: '900',
    color: Colors.white,
    lineHeight: 52,
  },
  dashed: {
    borderBottomWidth: 1,
    borderStyle: 'dashed',
    borderColor: 'rgba(255,255,255,0.35)',
  },
  ticketBottom: {
    flexDirection: 'row',
    gap: 18,
  },
  ticketCol: {
    gap: 2,
  },
  ticketMetaLabel: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.8,
    color: 'rgba(255,255,255,0.6)',
  },
  ticketMetaValue: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.white,
  },
  priorityBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.dangerLight,
    borderRadius: Radius.md,
    padding: 12,
  },
  priorityText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.danger,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 16,
    gap: 10,
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 2,
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
  footerButtons: {
    gap: 8,
  },
});
