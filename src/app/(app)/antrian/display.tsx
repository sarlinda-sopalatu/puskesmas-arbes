import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import { Button } from '@/components/ui/button';
import { Colors, Radius } from '@/constants/theme';
import { useData } from '@/lib/data';
import { formatJam, toISODate } from '@/lib/format';

export default function DisplayAntreanScreen() {
  const router = useRouter();
  const { queues, updateQueueStatus } = useData();
  const [clock, setClock] = useState(() => formatJam(new Date().toISOString()));

  useEffect(() => {
    const timer = setInterval(() => {
      setClock(formatJam(new Date().toISOString()));
    }, 30000);
    return () => clearInterval(timer);
  }, []);

  const today = toISODate();
  const active = queues.filter(
    (q) =>
      q.tanggal === today && (q.status === 'menunggu' || q.status === 'dipanggil'),
  );
  const current = active.filter((q) => q.status === 'dipanggil');
  const waiting = active
    .filter((q) => q.status === 'menunggu')
    .sort((a, b) => Number(b.priority) - Number(a.priority));

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom', 'left', 'right']}>
      <StatusBar style="light" />
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={10} style={styles.backButton}>
          <Ionicons name="arrow-back" size={22} color={Colors.white} />
        </Pressable>
        <View style={styles.headerInfo}>
          <Text style={styles.title}>Display Antrean</Text>
          <Text style={styles.subtitle}>Ruang Tunggu Puskesmas Arbes</Text>
        </View>
        <Text style={styles.clock}>{clock}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionLabel}>NOMOR DIPANGGIL</Text>
        {current.length === 0 ? (
          <View style={styles.emptyCall}>
            <Text style={styles.emptyCallText}>—</Text>
            <Text style={styles.emptyCallHint}>Menunggu panggilan berikutnya</Text>
          </View>
        ) : (
          <View style={styles.currentRow}>
            {current.map((queue) => (
              <View key={queue.id} style={styles.currentCard}>
                <Text style={styles.currentCode}>{queue.kode}</Text>
                <Text style={styles.currentPoli}>Poli {queue.poli}</Text>
              </View>
            ))}
          </View>
        )}

        <View style={styles.waitingHeader}>
          <Text style={styles.sectionLabel}>MENUNGGU</Text>
          <Text style={styles.waitingCount}>{waiting.length} antrean</Text>
        </View>
        {waiting.length === 0 ? (
          <View style={styles.waitingEmpty}>
            <Text style={styles.waitingEmptyText}>Belum ada antrean menunggu</Text>
          </View>
        ) : (
          <View style={styles.waitingGrid}>
            {waiting.map((queue) => (
              <View key={queue.id} style={styles.waitingChip}>
                <Text style={styles.waitingCode}>{queue.kode}</Text>
                <Text style={styles.waitingPoli}>Poli {queue.poli}</Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title="Panggil Berikutnya"
          icon="megaphone-outline"
          variant="white"
          disabled={waiting.length === 0}
          onPress={() => {
            if (waiting[0]) updateQueueStatus(waiting[0].id, 'dipanggil');
          }}
        />
        {current.length > 0 ? (
          <Button
            title="Tandai Selesai"
            icon="checkmark-outline"
            variant="secondary"
            onPress={() => {
              if (current[0]) updateQueueStatus(current[0].id, 'selesai');
            }}
          />
        ) : null}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.displayBg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: Radius.full,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerInfo: {
    flex: 1,
    gap: 1,
  },
  title: {
    fontSize: 17,
    fontWeight: '800',
    color: Colors.white,
  },
  subtitle: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.6)',
  },
  clock: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.white,
  },
  content: {
    padding: 16,
    gap: 14,
    paddingBottom: 8,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.4,
    color: 'rgba(255,255,255,0.55)',
  },
  emptyCall: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: Radius.xl,
    paddingVertical: 36,
    gap: 4,
  },
  emptyCallText: {
    fontSize: 64,
    fontWeight: '900',
    color: 'rgba(255,255,255,0.25)',
    lineHeight: 72,
  },
  emptyCallHint: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.5)',
  },
  currentRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  currentCard: {
    flexGrow: 1,
    minWidth: '45%',
    backgroundColor: Colors.primary,
    borderRadius: Radius.xl,
    paddingVertical: 28,
    paddingHorizontal: 20,
    alignItems: 'center',
    gap: 4,
  },
  currentCode: {
    fontSize: 56,
    fontWeight: '900',
    color: Colors.white,
    lineHeight: 62,
  },
  currentPoli: {
    fontSize: 14,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.85)',
  },
  waitingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  waitingCount: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.6)',
  },
  waitingGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  waitingChip: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: Radius.lg,
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignItems: 'center',
    gap: 2,
    minWidth: 92,
  },
  waitingCode: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.white,
  },
  waitingPoli: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.55)',
  },
  waitingEmpty: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: Radius.lg,
    padding: 24,
    alignItems: 'center',
  },
  waitingEmptyText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.5)',
  },
  footer: {
    padding: 16,
    gap: 8,
  },
});
