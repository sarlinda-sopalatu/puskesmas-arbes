import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Page } from '@/components/page';
import { SectionTitle } from '@/components/section-title';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { Colors, Radius, Shadow } from '@/constants/theme';
import { useAuth } from '@/lib/auth';
import { useData } from '@/lib/data';
import { formatJam, inisial, toISODate, umur } from '@/lib/format';
import { QUEUE_LABEL, QUEUE_TONE } from '@/lib/ui-helpers';

export default function PemeriksaanScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { queues, patients, examinations } = useData();

  const today = toISODate();
  const poliFilter = user?.role === 'dokter' && user.poli ? user.poli : null;

  const waiting = queues
    .filter(
      (q) =>
        q.tanggal === today &&
        (q.status === 'menunggu' || q.status === 'dipanggil') &&
        (!poliFilter || q.poli === poliFilter),
    )
    .sort((a, b) => Number(b.priority) - Number(a.priority));

  const done = examinations
    .filter((e) => e.tanggal === today)
    .filter((e) => {
      if (!poliFilter) return true;
      return queues.find((q) => q.id === e.queueId)?.poli === poliFilter;
    })
    .sort((a, b) => {
      const qa = queues.find((q) => q.id === a.queueId)?.finishedAt ?? '';
      const qb = queues.find((q) => q.id === b.queueId)?.finishedAt ?? '';
      return qb.localeCompare(qa);
    });

  const patientOf = (id: string) => patients.find((p) => p.id === id);
  const queueOf = (id: string) => queues.find((q) => q.id === id);

  return (
    <Page
      title="Pemeriksaan Dokter"
      subtitle={`${waiting.length} menunggu · ${done.length} selesai diperiksa`}>
      <SectionTitle title="Menunggu Pemeriksaan" />
      {waiting.length === 0 ? (
        <EmptyState
          icon="checkmark-done-outline"
          title="Tidak ada pasien menunggu"
          description="Semua pasien pada poli ini sudah ditangani."
        />
      ) : (
        <View style={styles.list}>
          {waiting.map((queue) => {
            const patient = patientOf(queue.patientId);
            return (
              <Card key={queue.id} style={styles.card}>
                <View style={styles.cardTop}>
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>
                      {inisial(patient?.nama ?? 'Pasien')}
                    </Text>
                  </View>
                  <View style={styles.cardInfo}>
                    <View style={styles.nameRow}>
                      <Text style={styles.name} numberOfLines={1}>
                        {patient?.nama ?? 'Pasien'}
                      </Text>
                      {queue.priority ? (
                        <Badge
                          label={queue.alasanPrioritas ?? 'Prioritas'}
                          tone="danger"
                        />
                      ) : null}
                    </View>
                    <Text style={styles.meta}>
                      {queue.kode} · Poli {queue.poli} ·{' '}
                      {patient ? `${umur(patient.tanggalLahir)} thn` : '-'} ·{' '}
                      {formatJam(queue.createdAt)}
                    </Text>
                    <Text style={styles.rm}>
                      {patient?.noRM ?? '-'} · {patient?.jenisKepersertaan ?? '-'}
                    </Text>
                  </View>
                  <Badge
                    label={QUEUE_LABEL[queue.status]}
                    tone={QUEUE_TONE[queue.status]}
                  />
                </View>
                <Button
                  title="Periksa Pasien"
                  size="sm"
                  icon="medkit-outline"
                  onPress={() =>
                    router.push(`/pemeriksaan/${queue.id}` as never)
                  }
                />
              </Card>
            );
          })}
        </View>
      )}

      <SectionTitle title="Sudah Diperiksa Hari Ini" />
      {done.length === 0 ? (
        <EmptyState
          icon="document-text-outline"
          title="Belum ada rekam medis"
          description="Rekam medis yang disimpan akan tampil di sini."
        />
      ) : (
        <View style={styles.list}>
          {done.map((exam) => {
            const patient = patientOf(exam.patientId);
            const queue = queueOf(exam.queueId);
            return (
              <Pressable
                key={exam.id}
                onPress={() =>
                  router.push(`/pemeriksaan/${exam.queueId}` as never)
                }
                style={({ pressed }) => [
                  styles.doneCard,
                  pressed && styles.pressed,
                ]}>
                <View style={styles.doneIcon}>
                  <Ionicons
                    name="document-text-outline"
                    size={20}
                    color={Colors.primaryDark}
                  />
                </View>
                <View style={styles.cardInfo}>
                  <Text style={styles.name} numberOfLines={1}>
                    {patient?.nama ?? 'Pasien'}
                  </Text>
                  <Text style={styles.meta} numberOfLines={1}>
                    {queue?.kode ?? '-'} · Poli {queue?.poli ?? '-'} ·{' '}
                    {exam.diagnosis}
                  </Text>
                  <Text style={styles.rm}>
                    {exam.resep.length} obat diresepkan
                    {exam.resepDiserahkan ? ' · sudah diserahkan' : ''}
                  </Text>
                </View>
                <Ionicons
                  name="chevron-forward"
                  size={18}
                  color={Colors.textMuted}
                />
              </Pressable>
            );
          })}
        </View>
      )}
    </Page>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: 10,
  },
  card: {
    gap: 12,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: Radius.full,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.primaryDark,
  },
  cardInfo: {
    flex: 1,
    gap: 2,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  name: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.text,
    flexShrink: 1,
  },
  meta: {
    fontSize: 11,
    color: Colors.textMuted,
  },
  rm: {
    fontSize: 10,
    color: Colors.textMuted,
  },
  doneCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 12,
    ...Shadow.card,
  },
  doneIcon: {
    width: 40,
    height: 40,
    borderRadius: Radius.md,
    backgroundColor: Colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.8,
  },
});
