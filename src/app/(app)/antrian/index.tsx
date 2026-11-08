import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import { Page } from '@/components/page';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { Segmented } from '@/components/ui/segmented';
import { Colors, Radius, Shadow } from '@/constants/theme';
import { useAuth } from '@/lib/auth';
import { useData } from '@/lib/data';
import { formatJam, toISODate } from '@/lib/format';
import type { QueueStatus } from '@/lib/types';
import { QUEUE_LABEL, QUEUE_TONE } from '@/lib/ui-helpers';

type FilterValue = 'semua' | QueueStatus;

export default function AntrianScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { queues, patients, updateQueueStatus } = useData();
  const [filter, setFilter] = useState<FilterValue>('semua');

  const today = toISODate();
  const todayQueues = queues.filter((q) => q.tanggal === today && q.status !== 'batal');
  const current = todayQueues.find((q) => q.status === 'dipanggil');
  const waiting = todayQueues
    .filter((q) => q.status === 'menunggu')
    .sort((a, b) => Number(b.priority) - Number(a.priority));
  const waitingCount = waiting.length;
  const calledCount = todayQueues.filter((q) => q.status === 'dipanggil').length;
  const doneCount = todayQueues.filter((q) => q.status === 'selesai').length;

  const filtered =
    filter === 'semua' ? todayQueues : todayQueues.filter((q) => q.status === filter);

  const sorted = [...filtered].sort((a, b) => {
    const order: Record<QueueStatus, number> = {
      dipanggil: 0,
      menunggu: 1,
      selesai: 2,
      batal: 3,
    };
    if (order[a.status] !== order[b.status]) return order[a.status] - order[b.status];
    if (a.status === 'menunggu' && a.priority !== b.priority) {
      return Number(b.priority) - Number(a.priority);
    }
    return a.kode.localeCompare(b.kode);
  });

  const canManage =
    user !== null && ['admin', 'pendaftaran', 'dokter', 'perawat'].includes(user.role);
  const canRegister = user !== null && ['admin', 'pendaftaran'].includes(user.role);

  const patientName = (id: string) =>
    patients.find((p) => p.id === id)?.nama ?? 'Pasien';

  const callQueue = (id: string, kode: string, nama: string) => {
    Alert.alert('Panggil Antrean', `Panggil ${kode} untuk ${nama}?`, [
      { text: 'Batal', style: 'cancel' },
      {
        text: 'Panggil',
        onPress: () => updateQueueStatus(id, 'dipanggil'),
      },
    ]);
  };

  const finishQueue = (id: string, kode: string, nama: string) => {
    Alert.alert('Selesaikan Antrean', `Tandai antrean ${kode} (${nama}) sebagai selesai?`, [
      { text: 'Batal', style: 'cancel' },
      { text: 'Selesai', onPress: () => updateQueueStatus(id, 'selesai') },
    ]);
  };

  const cancelQueue = (id: string, kode: string) => {
    Alert.alert('Batalkan Antrean', `Batalkan antrean ${kode}?`, [
      { text: 'Tidak', style: 'cancel' },
      {
        text: 'Batalkan',
        style: 'destructive',
        onPress: () => updateQueueStatus(id, 'batal'),
      },
    ]);
  };

  const callNext = () => {
    if (waitingCount === 0) {
      Alert.alert('Antrean kosong', 'Tidak ada pasien yang sedang menunggu.');
      return;
    }
    const next = waiting[0];
    callQueue(next.id, next.kode, patientName(next.patientId));
  };

  return (
    <Page
      title="Antrian Pasien"
      subtitle={`${waitingCount} menunggu · ${calledCount} dipanggil · ${doneCount} selesai`}
      right={
        <Pressable
          onPress={() => router.push('/antrian/display')}
          hitSlop={8}
          style={styles.headerButton}>
          <Ionicons name="tv-outline" size={20} color={Colors.text} />
        </Pressable>
      }
      footer={
        canRegister ? (
          <Button
            title="Ambil Nomor Antrean"
            icon="add-circle-outline"
            onPress={() => router.push('/antrian/ambil')}
          />
        ) : undefined
      }>
      <View style={styles.callCard}>
        <Text style={styles.callLabel}>SEDANG DIPANGGIL</Text>
        <View style={styles.callRow}>
          <Text style={styles.callCode}>{current?.kode ?? '—'}</Text>
          <View style={styles.callInfo}>
            <Text style={styles.callPoli}>
              {current ? `Poli ${current.poli}` : 'Belum ada panggilan'}
            </Text>
            <Text style={styles.callName} numberOfLines={1}>
              {current ? patientName(current.patientId) : 'Panggil antrean berikutnya'}
            </Text>
          </View>
          <Ionicons name="megaphone-outline" size={28} color={Colors.white} />
        </View>
        {canManage ? (
          <Button
            title="Panggil Berikutnya"
            variant="white"
            icon="megaphone-outline"
            size="sm"
            onPress={callNext}
          />
        ) : null}
      </View>

      <Segmented
        value={filter}
        onChange={(value) => setFilter(value as FilterValue)}
        options={[
          { value: 'semua', label: 'Semua' },
          { value: 'menunggu', label: 'Menunggu' },
          { value: 'dipanggil', label: 'Dipanggil' },
          { value: 'selesai', label: 'Selesai' },
        ]}
      />

      {sorted.length === 0 ? (
        <EmptyState
          icon="people-outline"
          title="Tidak ada antrean"
          description="Belum ada antrean pada filter ini."
        />
      ) : (
        <View style={styles.list}>
          {sorted.map((queue) => {
            const nama = patientName(queue.patientId);
            return (
              <Card key={queue.id} style={styles.queueCard}>
                <Pressable
                  onPress={() => router.push(`/antrian/${queue.id}` as never)}
                  style={styles.queueTop}>
                  <View style={styles.codeBox}>
                    <Text style={styles.codeText}>{queue.kode}</Text>
                  </View>
                  <View style={styles.queueInfo}>
                    <View style={styles.nameRow}>
                      <Text style={styles.queueName} numberOfLines={1}>
                        {nama}
                      </Text>
                      {queue.priority ? (
                        <Badge label={queue.alasanPrioritas ?? 'Prioritas'} tone="danger" />
                      ) : null}
                    </View>
                    <Text style={styles.queueMeta}>
                      Poli {queue.poli} · {formatJam(queue.createdAt)}
                      {queue.status === 'menunggu'
                        ? ` · Estimasi ${queue.estimasiMenit} mnt`
                        : ''}
                    </Text>
                  </View>
                  <Badge label={QUEUE_LABEL[queue.status]} tone={QUEUE_TONE[queue.status]} />
                </Pressable>

                {canManage && (queue.status === 'menunggu' || queue.status === 'dipanggil') ? (
                  <View style={styles.actions}>
                    {queue.status === 'menunggu' ? (
                      <Button
                        title="Panggil"
                        size="sm"
                        icon="megaphone-outline"
                        onPress={() => callQueue(queue.id, queue.kode, nama)}
                        style={styles.actionButton}
                      />
                    ) : (
                      <Button
                        title="Selesai"
                        size="sm"
                        icon="checkmark-outline"
                        onPress={() => finishQueue(queue.id, queue.kode, nama)}
                        style={styles.actionButton}
                      />
                    )}
                    <Button
                      title="Batalkan"
                      size="sm"
                      variant="secondary"
                      onPress={() => cancelQueue(queue.id, queue.kode)}
                      style={styles.actionButton}
                    />
                  </View>
                ) : null}
              </Card>
            );
          })}
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
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  callCard: {
    backgroundColor: Colors.primaryDark,
    borderRadius: Radius.lg,
    padding: 16,
    gap: 12,
    ...Shadow.card,
  },
  callLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
    color: 'rgba(255,255,255,0.7)',
  },
  callRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  callCode: {
    fontSize: 40,
    fontWeight: '900',
    color: Colors.white,
    letterSpacing: 0.5,
  },
  callInfo: {
    flex: 1,
    gap: 2,
  },
  callPoli: {
    fontSize: 12,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.8)',
  },
  callName: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.white,
  },
  list: {
    gap: 10,
  },
  queueCard: {
    gap: 12,
  },
  queueTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  codeBox: {
    minWidth: 56,
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: Radius.md,
    backgroundColor: Colors.primarySoft,
    alignItems: 'center',
  },
  codeText: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.primaryDark,
  },
  queueInfo: {
    flex: 1,
    gap: 3,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  queueName: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.text,
    flexShrink: 1,
  },
  queueMeta: {
    fontSize: 11,
    color: Colors.textMuted,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: 10,
  },
  actionButton: {
    flex: 1,
  },
});
