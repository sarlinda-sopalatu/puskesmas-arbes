import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Alert, Share, StyleSheet, Text, View } from 'react-native';

import { Page } from '@/components/page';
import { SectionTitle } from '@/components/section-title';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Chips } from '@/components/ui/chips';
import { Colors, Radius } from '@/constants/theme';
import { useData } from '@/lib/data';
import {
  formatRupiah,
  formatRupiahSingkat,
  formatTanggalPanjang,
  toISODate,
} from '@/lib/format';
import { ROLE_LABEL } from '@/lib/roles';
import type { Role } from '@/lib/types';
import { stokMenipis } from '@/lib/ui-helpers';

type Periode = 'hari-ini' | 'semua';

export default function LaporanScreen() {
  const { queues, examinations, bills, medicines, users } = useData();
  const [periode, setPeriode] = useState<Periode>('hari-ini');

  const today = toISODate();
  const scopeQueues =
    periode === 'hari-ini' ? queues.filter((q) => q.tanggal === today) : queues;
  const scopeExams =
    periode === 'hari-ini'
      ? examinations.filter((e) => e.tanggal === today)
      : examinations;
  const paidScope = bills.filter(
    (b) => b.status === 'lunas' && (periode === 'semua' || b.tanggal === today),
  );

  const kunjungan = scopeQueues.filter((q) => q.status !== 'batal').length;
  const selesai = scopeQueues.filter((q) => q.status === 'selesai').length;
  const pendapatan = paidScope.reduce(
    (sum, b) => sum + b.items.reduce((s, i) => s + i.biaya, 0),
    0,
  );
  const lowStock = medicines.filter((m) => stokMenipis(m.stok, m.stokMinimum));

  const poliData = [
    { label: 'Umum', value: 'Umum', color: Colors.primary },
    { label: 'Gigi', value: 'Gigi', color: Colors.cyan },
    { label: 'Anak', value: 'Anak', color: Colors.purple },
    { label: 'KIA', value: 'KIA', color: Colors.pink },
    { label: 'TB Paru', value: 'TB Paru', color: Colors.amber },
  ].map((poli) => ({
    ...poli,
    count: scopeQueues.filter(
      (q) => q.poli === poli.value && q.status !== 'batal',
    ).length,
  }));
  const maxPoli = Math.max(...poliData.map((p) => p.count), 1);

  const penyakitMap = new Map<string, number>();
  scopeExams.forEach((exam) => {
    const key = exam.diagnosis.trim();
    if (key) penyakitMap.set(key, (penyakitMap.get(key) ?? 0) + 1);
  });
  const penyakit = Array.from(penyakitMap.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const obatMap = new Map<string, number>();
  scopeExams.forEach((exam) => {
    exam.resep.forEach((item) => {
      obatMap.set(
        item.medicineId,
        (obatMap.get(item.medicineId) ?? 0) + item.jumlah,
      );
    });
  });
  const obatData = Array.from(obatMap.entries())
    .map(([id, jumlah]) => ({
      name: medicines.find((m) => m.id === id)?.nama ?? 'Obat',
      jumlah,
    }))
    .sort((a, b) => b.jumlah - a.jumlah)
    .slice(0, 5);

  const petugasAktif = users.filter((u) => u.active);
  const roleOrder: Role[] = [
    'admin',
    'pendaftaran',
    'dokter',
    'perawat',
    'farmasi',
    'kasir',
  ];
  const roleCounts = roleOrder.map((role) => ({
    role,
    count: petugasAktif.filter((u) => u.role === role).length,
  }));

  const handleExport = async () => {
    const message = [
      '*LAPORAN PUSKESMAS ARBES*',
      `Periode: ${
        periode === 'hari-ini' ? formatTanggalPanjang(today) : 'Semua data'
      }`,
      '',
      `Total kunjungan: ${kunjungan}`,
      `Antrean selesai: ${selesai}`,
      `Pendapatan: ${formatRupiah(pendapatan)}`,
      `Stok menipis: ${lowStock.length}`,
      '',
      'Kunjungan per poli:',
      ...poliData.map((p) => `- ${p.label}: ${p.count}`),
      '',
      'Penyakit terbanyak:',
      ...(penyakit.length > 0
        ? penyakit.map((p, index) => `${index + 1}. ${p.name}: ${p.count}`)
        : ['- Belum ada data diagnosis']),
      '',
      'Penggunaan obat:',
      ...(obatData.length > 0
        ? obatData.map((o) => `- ${o.name}: ${o.jumlah} unit`)
        : ['- Belum ada data resep']),
    ].join('\n');

    try {
      await Share.share({ message });
    } catch {
      Alert.alert('Gagal', 'Laporan tidak dapat dibagikan.');
    }
  };

  return (
    <Page
      title="Laporan & Dashboard"
      subtitle={
        periode === 'hari-ini' ? formatTanggalPanjang(today) : 'Semua data'
      }
      footer={
        <Button
          title="Export / Bagikan Laporan"
          icon="share-social-outline"
          onPress={handleExport}
        />
      }>
      <Chips
        options={[
          { value: 'hari-ini', label: 'Hari Ini' },
          { value: 'semua', label: 'Semua Data' },
        ]}
        value={periode}
        onChange={(value) => setPeriode(value as Periode)}
      />

      <View style={styles.grid}>
        <SummaryCard
          icon="people-outline"
          value={String(kunjungan)}
          label="Total Kunjungan"
          color={Colors.primary}
          bg={Colors.primaryLight}
        />
        <SummaryCard
          icon="checkmark-circle-outline"
          value={String(selesai)}
          label="Antrean Selesai"
          color={Colors.success}
          bg={Colors.successLight}
        />
        <SummaryCard
          icon="cash-outline"
          value={formatRupiahSingkat(pendapatan)}
          label="Pendapatan"
          color={Colors.amber}
          bg={Colors.amberLight}
        />
        <SummaryCard
          icon="alert-circle-outline"
          value={String(lowStock.length)}
          label="Stok Menipis"
          color={Colors.danger}
          bg={Colors.dangerLight}
        />
      </View>

      <SectionTitle title="Kunjungan per Poli" />
      <Card style={styles.sectionCard}>
        {poliData.map((poli) => (
          <View key={poli.value} style={styles.barRow}>
            <Text style={styles.barLabel}>{poli.label}</Text>
            <View style={styles.barTrack}>
              <View
                style={[
                  styles.barFill,
                  {
                    width: `${Math.max((poli.count / maxPoli) * 100, 3)}%` as `${number}%`,
                    backgroundColor: poli.color,
                  },
                ]}
              />
            </View>
            <Text style={styles.barValue}>{poli.count}</Text>
          </View>
        ))}
      </Card>

      <SectionTitle title="Penyakit Terbanyak" />
      <Card style={styles.sectionCard}>
        {penyakit.length === 0 ? (
          <Text style={styles.emptyText}>
            Belum ada data diagnosis pada periode ini.
          </Text>
        ) : (
          penyakit.map((item, index) => (
            <View key={item.name} style={styles.rankRow}>
              <View style={styles.rankBadge}>
                <Text style={styles.rankText}>{index + 1}</Text>
              </View>
              <Text style={styles.rankName}>{item.name}</Text>
              <Text style={styles.rankCount}>{item.count} kasus</Text>
            </View>
          ))
        )}
      </Card>

      <SectionTitle title="Penggunaan Obat" />
      <Card style={styles.sectionCard}>
        {obatData.length === 0 ? (
          <Text style={styles.emptyText}>
            Belum ada data resep pada periode ini.
          </Text>
        ) : (
          obatData.map((item) => (
            <View key={item.name} style={styles.obatRow}>
              <Ionicons
                name="flask-outline"
                size={16}
                color={Colors.cyan}
              />
              <Text style={styles.rankName}>{item.name}</Text>
              <Text style={styles.rankCount}>{item.jumlah} unit</Text>
            </View>
          ))
        )}
      </Card>

      <SectionTitle title="Petugas Aktif" />
      <Card style={styles.sectionCard}>
        <View style={styles.petugasTotal}>
          <Text style={styles.petugasTotalValue}>{petugasAktif.length}</Text>
          <Text style={styles.petugasTotalLabel}>petugas aktif</Text>
        </View>
        {roleCounts.map((item) => (
          <View key={item.role} style={styles.rankRow}>
            <Text style={styles.rankName}>{ROLE_LABEL[item.role]}</Text>
            <Text style={styles.rankCount}>{item.count} orang</Text>
          </View>
        ))}
      </Card>
    </Page>
  );
}

function SummaryCard({
  icon,
  value,
  label,
  color,
  bg,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  value: string;
  label: string;
  color: string;
  bg: string;
}) {
  return (
    <View style={styles.summaryCard}>
      <View style={[styles.summaryIcon, { backgroundColor: bg }]}>
        <Ionicons name={icon} size={18} color={color} />
      </View>
      <Text style={styles.summaryValue} numberOfLines={1} adjustsFontSizeToFit>
        {value}
      </Text>
      <Text style={styles.summaryLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  summaryCard: {
    width: '48%',
    flexGrow: 1,
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 12,
    gap: 4,
  },
  summaryIcon: {
    width: 32,
    height: 32,
    borderRadius: Radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryValue: {
    fontSize: 19,
    fontWeight: '800',
    color: Colors.text,
  },
  summaryLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textMuted,
  },
  sectionCard: {
    gap: 10,
  },
  barRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  barLabel: {
    width: 52,
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  barTrack: {
    flex: 1,
    height: 8,
    borderRadius: Radius.full,
    backgroundColor: Colors.background,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: Radius.full,
  },
  barValue: {
    width: 22,
    fontSize: 11,
    fontWeight: '800',
    color: Colors.text,
    textAlign: 'right',
  },
  emptyText: {
    fontSize: 11,
    color: Colors.textMuted,
    lineHeight: 16,
  },
  rankRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  rankBadge: {
    width: 24,
    height: 24,
    borderRadius: Radius.full,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankText: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.primaryDark,
  },
  rankName: {
    flex: 1,
    fontSize: 12,
    fontWeight: '600',
    color: Colors.text,
  },
  rankCount: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textMuted,
  },
  obatRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  petugasTotal: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
    marginBottom: 4,
  },
  petugasTotalValue: {
    fontSize: 26,
    fontWeight: '900',
    color: Colors.primaryDark,
  },
  petugasTotalLabel: {
    fontSize: 12,
    color: Colors.textMuted,
  },
});
