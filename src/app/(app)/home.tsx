import { Ionicons } from '@expo/vector-icons';
import { Redirect, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { MenuGrid } from '@/components/menu-grid';
import { SectionTitle } from '@/components/section-title';
import { Badge } from '@/components/ui/badge';
import { StatCard } from '@/components/ui/stat-card';
import { Colors, Radius, Shadow } from '@/constants/theme';
import { useAuth } from '@/lib/auth';
import { useData } from '@/lib/data';
import {
  formatRupiahSingkat,
  formatTanggalPanjang,
  inisial,
  toISODate,
} from '@/lib/format';
import { menuForRole, ROLE_LABEL } from '@/lib/roles';
import type { Role } from '@/lib/types';
import { isKadaluarsa, QUEUE_LABEL, QUEUE_TONE } from '@/lib/ui-helpers';

type Stat = {
  label: string;
  value: string | number;
  icon: keyof typeof Ionicons.glyphMap;
  color?: string;
  bg?: string;
};

export default function HomeScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const { patients, queues, medicines, bills } = useData();

  if (!user) {
    return <Redirect href="/login" />;
  }

  const today = toISODate();
  const todayQueues = queues.filter((q) => q.tanggal === today);
  const waiting = todayQueues.filter((q) => q.status === 'menunggu');
  const dipanggil = todayQueues.filter((q) => q.status === 'dipanggil');
  const selesai = todayQueues.filter((q) => q.status === 'selesai');
  const prioritas = waiting.filter((q) => q.priority);
  const lowStock = medicines.filter((m) => m.stok <= m.stokMinimum);
  const expired = medicines.filter((m) => isKadaluarsa(m.kadaluarsa));
  const unpaid = bills.filter((b) => b.status === 'belum');
  const paidToday = bills.filter((b) => b.status === 'lunas' && b.tanggal === today);
  const revenue = paidToday.reduce(
    (sum, b) => sum + b.items.reduce((s, i) => s + i.biaya, 0),
    0,
  );
  const poliQueues = user.poli
    ? todayQueues.filter((q) => q.poli === user.poli)
    : todayQueues;

  const statsByRole: Record<Role, Stat[]> = {
    admin: [
      {
        label: 'Total Pasien',
        value: patients.length,
        icon: 'people-outline',
        color: Colors.primary,
        bg: Colors.primaryLight,
      },
      {
        label: 'Antrian Menunggu',
        value: waiting.length,
        icon: 'time-outline',
        color: Colors.amber,
        bg: Colors.amberLight,
      },
      {
        label: 'Stok Menipis',
        value: lowStock.length,
        icon: 'alert-circle-outline',
        color: Colors.danger,
        bg: Colors.dangerLight,
      },
    ],
    pendaftaran: [
      {
        label: 'Total Pasien',
        value: patients.length,
        icon: 'people-outline',
        color: Colors.primary,
        bg: Colors.primaryLight,
      },
      {
        label: 'Menunggu',
        value: waiting.length,
        icon: 'time-outline',
        color: Colors.amber,
        bg: Colors.amberLight,
      },
      {
        label: 'Selesai Hari Ini',
        value: selesai.length,
        icon: 'checkmark-circle-outline',
        color: Colors.success,
        bg: Colors.successLight,
      },
    ],
    dokter: [
      {
        label: `Pasien Poli ${user.poli ?? 'Umum'}`,
        value: poliQueues.length,
        icon: 'medkit-outline',
        color: Colors.purple,
        bg: Colors.purpleLight,
      },
      {
        label: 'Menunggu',
        value: waiting.length,
        icon: 'time-outline',
        color: Colors.amber,
        bg: Colors.amberLight,
      },
      {
        label: 'Selesai Hari Ini',
        value: selesai.length,
        icon: 'checkmark-circle-outline',
        color: Colors.success,
        bg: Colors.successLight,
      },
    ],
    perawat: [
      {
        label: 'Menunggu',
        value: waiting.length,
        icon: 'time-outline',
        color: Colors.amber,
        bg: Colors.amberLight,
      },
      {
        label: 'Prioritas',
        value: prioritas.length,
        icon: 'alert-circle-outline',
        color: Colors.danger,
        bg: Colors.dangerLight,
      },
      {
        label: 'Dipanggil',
        value: dipanggil.length,
        icon: 'megaphone-outline',
        color: Colors.info,
        bg: Colors.infoLight,
      },
    ],
    farmasi: [
      {
        label: 'Jenis Obat',
        value: medicines.length,
        icon: 'flask-outline',
        color: Colors.cyan,
        bg: Colors.cyanLight,
      },
      {
        label: 'Stok Menipis',
        value: lowStock.length,
        icon: 'trending-down-outline',
        color: Colors.amber,
        bg: Colors.amberLight,
      },
      {
        label: 'Kadaluarsa',
        value: expired.length,
        icon: 'close-circle-outline',
        color: Colors.danger,
        bg: Colors.dangerLight,
      },
    ],
    kasir: [
      {
        label: 'Tagihan Belum',
        value: unpaid.length,
        icon: 'receipt-outline',
        color: Colors.amber,
        bg: Colors.amberLight,
      },
      {
        label: 'Pendapatan Hari Ini',
        value: formatRupiahSingkat(revenue),
        icon: 'cash-outline',
        color: Colors.primary,
        bg: Colors.primaryLight,
      },
      {
        label: 'Transaksi Lunas',
        value: paidToday.length,
        icon: 'checkmark-circle-outline',
        color: Colors.success,
        bg: Colors.successLight,
      },
    ],
  };

  const stats = statsByRole[user.role];
  const menu = menuForRole(user.role);
  const recent = [...todayQueues]
    .filter((q) => q.status === 'menunggu' || q.status === 'dipanggil')
    .sort((a, b) => {
      if (a.status !== b.status) return a.status === 'dipanggil' ? -1 : 1;
      return Number(b.priority) - Number(a.priority);
    })
    .slice(0, 4);

  const patientName = (id: string) =>
    patients.find((p) => p.id === id)?.nama ?? 'Pasien';

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <SafeAreaView edges={['top']} style={styles.heroSafe}>
        <View style={styles.hero}>
          <View style={styles.heroTop}>
            <View style={styles.heroInfo}>
              <Text style={styles.hello}>Selamat datang,</Text>
              <Text style={styles.name} numberOfLines={1}>
                {user.name}
              </Text>
              <View style={styles.rolePill}>
                <Text style={styles.roleText}>{ROLE_LABEL[user.role]}</Text>
              </View>
            </View>
            <Pressable
              onPress={() => router.push('/profil')}
              style={styles.avatar}
              hitSlop={6}>
              <Text style={styles.avatarText}>{inisial(user.name)}</Text>
            </Pressable>
          </View>
          <Text style={styles.heroDate}>{formatTanggalPanjang(today)}</Text>
        </View>
      </SafeAreaView>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>
        <View style={styles.statsRow}>
          {stats.map((stat) => (
            <StatCard
              key={stat.label}
              label={stat.label}
              value={stat.value}
              icon={stat.icon}
              color={stat.color}
              bg={stat.bg}
            />
          ))}
        </View>

        <View style={styles.section}>
          <SectionTitle title="Menu Utama" />
          <MenuGrid items={menu} />
        </View>

        <View style={styles.section}>
          <SectionTitle
            title="Antrian Hari Ini"
            actionLabel="Lihat semua"
            onPressAction={() => router.push('/antrian')}
          />
          {recent.length === 0 ? (
            <View style={styles.emptyBox}>
              <Ionicons name="cafe-outline" size={20} color={Colors.textMuted} />
              <Text style={styles.emptyText}>Belum ada antrian aktif hari ini.</Text>
            </View>
          ) : (
            <View style={styles.queueList}>
              {recent.map((queue) => (
                <Pressable
                  key={queue.id}
                  onPress={() => router.push(`/antrian/${queue.id}` as never)}
                  style={({ pressed }) => [styles.queueRow, pressed && styles.pressed]}>
                  <View style={styles.queueCode}>
                    <Text style={styles.queueCodeText}>{queue.kode}</Text>
                  </View>
                  <View style={styles.queueInfo}>
                    <Text style={styles.queueName} numberOfLines={1}>
                      {patientName(queue.patientId)}
                    </Text>
                    <Text style={styles.queueMeta}>
                      Poli {queue.poli}
                      {queue.priority
                        ? ' · Prioritas'
                        : ` · Estimasi ${queue.estimasiMenit} mnt`}
                    </Text>
                  </View>
                  <Badge
                    label={QUEUE_LABEL[queue.status]}
                    tone={QUEUE_TONE[queue.status]}
                  />
                </Pressable>
              ))}
            </View>
          )}
        </View>

        <Pressable
          onPress={() => router.push('/profil')}
          style={({ pressed }) => [styles.infoCard, pressed && styles.pressed]}>
          <View style={styles.infoIcon}>
            <Ionicons name="shield-checkmark" size={18} color={Colors.primaryDark} />
          </View>
          <View style={styles.infoBody}>
            <Text style={styles.infoTitle}>Akses sesuai peran</Text>
            <Text style={styles.infoText}>
              Menu yang tampil disesuaikan dengan hak akses akun Anda.
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  heroSafe: {
    backgroundColor: Colors.primary,
  },
  hero: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 64,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    gap: 16,
  },
  heroTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  heroInfo: {
    flex: 1,
    gap: 2,
  },
  hello: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.85)',
  },
  name: {
    fontSize: 21,
    fontWeight: '800',
    color: Colors.white,
  },
  rolePill: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: Radius.full,
    paddingVertical: 3,
    paddingHorizontal: 10,
    marginTop: 6,
  },
  roleText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.white,
  },
  heroDate: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.75)',
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: Radius.full,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.primaryDark,
  },
  scroll: {
    flex: 1,
    marginTop: -44,
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 32,
    gap: 20,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  section: {
    gap: 12,
  },
  queueList: {
    gap: 8,
  },
  queueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 12,
    ...Shadow.card,
  },
  queueCode: {
    minWidth: 58,
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: Radius.md,
    backgroundColor: Colors.primarySoft,
    alignItems: 'center',
  },
  queueCodeText: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.primaryDark,
  },
  queueInfo: {
    flex: 1,
    gap: 2,
  },
  queueName: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.text,
  },
  queueMeta: {
    fontSize: 11,
    color: Colors.textMuted,
  },
  emptyBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 16,
  },
  emptyText: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Colors.primarySoft,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.primaryLight,
    padding: 14,
  },
  infoIcon: {
    width: 36,
    height: 36,
    borderRadius: Radius.md,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoBody: {
    flex: 1,
    gap: 2,
  },
  infoTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.primaryDark,
  },
  infoText: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
  pressed: {
    opacity: 0.8,
  },
});
