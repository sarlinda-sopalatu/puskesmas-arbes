import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Alert, Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { Page } from '@/components/page';
import { SectionTitle } from '@/components/section-title';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { Segmented } from '@/components/ui/segmented';
import { Colors, Radius } from '@/constants/theme';
import { useData } from '@/lib/data';
import {
  formatJam,
  formatRupiah,
  formatRupiahSingkat,
  formatTanggal,
  inisial,
  toISODate,
} from '@/lib/format';
import type { Bill, MetodeBayar } from '@/lib/types';

const METODE: MetodeBayar[] = ['Tunai', 'BPJS', 'Transfer'];

export default function PembayaranScreen() {
  const { bills, patients, payBill } = useData();
  const [tab, setTab] = useState<'tagihan' | 'riwayat'>('tagihan');
  const [payId, setPayId] = useState<string | null>(null);
  const [metode, setMetode] = useState<MetodeBayar>('Tunai');

  const today = toISODate();
  const unpaid = bills.filter((b) => b.status === 'belum');
  const paid = bills
    .filter((b) => b.status === 'lunas')
    .sort((a, b) => (b.paidAt ?? '').localeCompare(a.paidAt ?? ''));
  const paidToday = paid.filter((b) => b.tanggal === today);
  const revenueToday = paidToday.reduce((sum, b) => sum + billTotal(b), 0);
  const unpaidTotal = unpaid.reduce((sum, b) => sum + billTotal(b), 0);

  const target = payId ? bills.find((b) => b.id === payId) : undefined;
  const targetPatient = target
    ? patients.find((p) => p.id === target.patientId)
    : undefined;

  const handlePay = () => {
    if (!target) return;
    payBill(target.id, metode);
    setPayId(null);
    Alert.alert(
      'Pembayaran Berhasil',
      `Tagihan sebesar ${formatRupiah(billTotal(target))} telah dibayar via ${metode}.`,
    );
  };

  const patientName = (id: string) =>
    patients.find((p) => p.id === id)?.nama ?? 'Pasien';

  return (
    <Page
      title="Pembayaran"
      subtitle={`${unpaid.length} tagihan belum dibayar`}>
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{formatRupiahSingkat(unpaidTotal)}</Text>
          <Text style={styles.statLabel}>Belum dibayar</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{formatRupiahSingkat(revenueToday)}</Text>
          <Text style={styles.statLabel}>Pendapatan hari ini</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{paidToday.length}</Text>
          <Text style={styles.statLabel}>Transaksi lunas</Text>
        </View>
      </View>

      <Segmented
        value={tab}
        onChange={(value) => setTab(value as 'tagihan' | 'riwayat')}
        options={[
          { value: 'tagihan', label: 'Tagihan' },
          { value: 'riwayat', label: 'Riwayat' },
        ]}
      />

      {tab === 'tagihan' ? (
        <>
          {unpaid.length === 0 ? (
            <EmptyState
              icon="checkmark-done-outline"
              title="Semua tagihan lunas"
              description="Tidak ada tagihan yang menunggu pembayaran."
            />
          ) : (
            <View style={styles.list}>
              {unpaid.map((bill) => (
                <Card key={bill.id} style={styles.billCard}>
                  <View style={styles.billTop}>
                    <View style={styles.avatar}>
                      <Text style={styles.avatarText}>
                        {inisial(patientName(bill.patientId))}
                      </Text>
                    </View>
                    <View style={styles.billInfo}>
                      <Text style={styles.billName}>
                        {patientName(bill.patientId)}
                      </Text>
                      <Text style={styles.billMeta}>
                        {formatTanggal(bill.tanggal)} · {bill.items.length} item
                      </Text>
                    </View>
                    <Badge label="Belum Bayar" tone="warning" />
                  </View>

                  <View style={styles.itemsBox}>
                    {bill.items.map((item) => (
                      <View key={item.label} style={styles.itemRow}>
                        <Text style={styles.itemLabel}>{item.label}</Text>
                        <Text style={styles.itemValue}>
                          {formatRupiah(item.biaya)}
                        </Text>
                      </View>
                    ))}
                  </View>

                  <View style={styles.totalRow}>
                    <Text style={styles.totalLabel}>Total tagihan</Text>
                    <Text style={styles.totalValue}>
                      {formatRupiah(billTotal(bill))}
                    </Text>
                  </View>

                  <Button
                    title="Proses Pembayaran"
                    size="sm"
                    icon="card-outline"
                    onPress={() => {
                      setMetode(
                        patients.find((p) => p.id === bill.patientId)
                          ?.jenisKepersertaan === 'BPJS'
                          ? 'BPJS'
                          : 'Tunai',
                      );
                      setPayId(bill.id);
                    }}
                  />
                </Card>
              ))}
            </View>
          )}

          <SectionTitle title="Tarif Layanan" />
          <Card style={styles.tarifCard}>
            <TarifRow label="Konsultasi dokter" value={15000} />
            <TarifRow label="Pemeriksaan fisik" value={10000} />
            <TarifRow label="Tindakan medis" value={10000} />
            <TarifRow label="Obat" valueLabel="Sesuai harga satuan" last />
          </Card>
        </>
      ) : (
        <>
          {paid.length === 0 ? (
            <EmptyState
              icon="receipt-outline"
              title="Belum ada transaksi"
              description="Pembayaran yang selesai akan tercatat di sini."
            />
          ) : (
            <View style={styles.list}>
              {paid.map((bill) => (
                <Card key={bill.id} style={styles.paidCard}>
                  <View style={styles.billTop}>
                    <View style={styles.paidIcon}>
                      <Ionicons
                        name="checkmark-circle"
                        size={20}
                        color={Colors.success}
                      />
                    </View>
                    <View style={styles.billInfo}>
                      <Text style={styles.billName}>
                        {patientName(bill.patientId)}
                      </Text>
                      <Text style={styles.billMeta}>
                        {formatTanggal(bill.tanggal)} · {bill.metode}
                        {bill.paidAt ? ` · ${formatJam(bill.paidAt)}` : ''}
                      </Text>
                    </View>
                    <Text style={styles.paidAmount}>
                      {formatRupiah(billTotal(bill))}
                    </Text>
                  </View>
                  <View style={styles.paidFooter}>
                    <Badge label="Lunas" tone="success" />
                    <Text style={styles.receiptNo}>
                      No. {bill.id.toUpperCase()}
                    </Text>
                  </View>
                </Card>
              ))}
            </View>
          )}
        </>
      )}

      <Modal
        visible={payId !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setPayId(null)}>
        <View style={styles.overlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Pembayaran Tagihan</Text>
            <View style={styles.modalPatient}>
              <Text style={styles.modalName}>{targetPatient?.nama}</Text>
              <Text style={styles.modalMeta}>
                {targetPatient?.noRM} · {targetPatient?.jenisKepersertaan}
              </Text>
            </View>

            <View style={styles.modalTotalRow}>
              <Text style={styles.modalTotalLabel}>Total</Text>
              <Text style={styles.modalTotalValue}>
                {target ? formatRupiah(billTotal(target)) : '-'}
              </Text>
            </View>

            <Text style={styles.modalLabel}>Metode pembayaran</Text>
            <View style={styles.metodeRow}>
              {METODE.map((item) => {
                const active = item === metode;
                return (
                  <Pressable
                    key={item}
                    onPress={() => setMetode(item)}
                    style={[styles.metodeChip, active && styles.metodeChipActive]}>
                    <Text
                      style={[
                        styles.metodeText,
                        active && styles.metodeTextActive,
                      ]}>
                      {item}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <View style={styles.modalActions}>
              <Button
                title="Batal"
                variant="secondary"
                onPress={() => setPayId(null)}
                style={styles.flexButton}
              />
              <Button
                title="Bayar"
                onPress={handlePay}
                style={styles.flexButton}
              />
            </View>
          </View>
        </View>
      </Modal>
    </Page>
  );
}

function billTotal(bill: Bill): number {
  return bill.items.reduce((sum, item) => sum + item.biaya, 0);
}

function TarifRow({
  label,
  value,
  valueLabel,
  last,
}: {
  label: string;
  value?: number;
  valueLabel?: string;
  last?: boolean;
}) {
  return (
    <View style={[styles.tarifRow, !last && styles.tarifRowBorder]}>
      <Text style={styles.tarifLabel}>{label}</Text>
      <Text style={styles.tarifValue}>
        {valueLabel ?? (value !== undefined ? formatRupiah(value) : '-')}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  statsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 12,
    gap: 2,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.primaryDark,
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.textMuted,
  },
  list: {
    gap: 10,
  },
  billCard: {
    gap: 12,
  },
  billTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: Radius.full,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.primaryDark,
  },
  billInfo: {
    flex: 1,
    gap: 2,
  },
  billName: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.text,
  },
  billMeta: {
    fontSize: 11,
    color: Colors.textMuted,
  },
  itemsBox: {
    backgroundColor: Colors.background,
    borderRadius: Radius.md,
    padding: 10,
    gap: 6,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  itemLabel: {
    flex: 1,
    fontSize: 11,
    color: Colors.textSecondary,
  },
  itemValue: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.text,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: 10,
  },
  totalLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  totalValue: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.primaryDark,
  },
  tarifCard: {
    gap: 0,
    paddingVertical: 4,
  },
  tarifRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    gap: 12,
  },
  tarifRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  tarifLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  tarifValue: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.text,
  },
  paidCard: {
    gap: 10,
  },
  paidIcon: {
    width: 38,
    height: 38,
    borderRadius: Radius.full,
    backgroundColor: Colors.successLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  paidAmount: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.text,
  },
  paidFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: 8,
  },
  receiptNo: {
    fontSize: 10,
    color: Colors.textMuted,
  },
  overlay: {
    flex: 1,
    backgroundColor: Colors.overlay,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  modalCard: {
    width: '100%',
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: 18,
    gap: 12,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.text,
  },
  modalPatient: {
    backgroundColor: Colors.background,
    borderRadius: Radius.md,
    padding: 10,
    gap: 2,
  },
  modalName: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.text,
  },
  modalMeta: {
    fontSize: 11,
    color: Colors.textMuted,
  },
  modalTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalTotalLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  modalTotalValue: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.primaryDark,
  },
  modalLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  metodeRow: {
    flexDirection: 'row',
    gap: 8,
  },
  metodeChip: {
    flex: 1,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    paddingVertical: 10,
    alignItems: 'center',
  },
  metodeChipActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryLight,
  },
  metodeText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  metodeTextActive: {
    color: Colors.primaryDark,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  flexButton: {
    flex: 1,
  },
});
