import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Alert, Modal, StyleSheet, Text, View } from 'react-native';

import { Page } from '@/components/page';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { Input } from '@/components/ui/input';
import { SearchInput } from '@/components/ui/search-input';
import { Segmented } from '@/components/ui/segmented';
import { Colors, Radius } from '@/constants/theme';
import { useData } from '@/lib/data';
import {
  formatBulan,
  formatRupiah,
  formatTanggal,
  inisial,
} from '@/lib/format';
import {
  isHampirKadaluarsa,
  isKadaluarsa,
  stokMenipis,
} from '@/lib/ui-helpers';

type StockModal = { medicineId: string; mode: 'terima' | 'keluar' } | null;

export default function FarmasiScreen() {
  const {
    medicines,
    examinations,
    patients,
    receiveStock,
    dispenseStock,
    dispensePrescription,
  } = useData();
  const [tab, setTab] = useState<'stok' | 'resep'>('stok');
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState<StockModal>(null);
  const [qty, setQty] = useState('10');

  const filtered = medicines.filter(
    (m) =>
      m.nama.toLowerCase().includes(search.toLowerCase()) ||
      m.kategori.toLowerCase().includes(search.toLowerCase()),
  );
  const lowStock = medicines.filter((m) => stokMenipis(m.stok, m.stokMinimum));
  const expired = medicines.filter((m) => isKadaluarsa(m.kadaluarsa));
  const nearExpiry = medicines.filter((m) => isHampirKadaluarsa(m.kadaluarsa));
  const selected = modal
    ? medicines.find((m) => m.id === modal.medicineId)
    : undefined;

  const openModal = (medicineId: string, mode: 'terima' | 'keluar') => {
    setModal({ medicineId, mode });
    setQty('10');
  };

  const closeModal = () => setModal(null);

  const confirmModal = () => {
    if (!modal) return;
    const amount = Number(qty);
    if (!Number.isFinite(amount) || amount <= 0) {
      Alert.alert('Jumlah tidak valid', 'Masukkan jumlah lebih dari 0.');
      return;
    }
    if (modal.mode === 'terima') {
      receiveStock(modal.medicineId, amount);
    } else {
      dispenseStock(modal.medicineId, amount);
    }
    setModal(null);
    Alert.alert(
      'Berhasil',
      `${modal.mode === 'terima' ? 'Penerimaan' : 'Pengeluaran'} obat dicatat.`,
    );
  };

  const resepList = examinations
    .filter((e) => e.resep.length > 0)
    .sort((a, b) => b.tanggal.localeCompare(a.tanggal));

  return (
    <Page
      title="Farmasi & Obat"
      subtitle={`${medicines.length} jenis obat · ${lowStock.length} stok menipis`}>
      <Segmented
        value={tab}
        onChange={(value) => setTab(value as 'stok' | 'resep')}
        options={[
          { value: 'stok', label: 'Stok Obat' },
          { value: 'resep', label: 'Resep Elektronik' },
        ]}
      />

      {tab === 'stok' ? (
        <>
          {lowStock.length > 0 || expired.length > 0 ? (
            <View style={styles.warningBanner}>
              <Ionicons
                name="alert-circle"
                size={18}
                color={Colors.warning}
              />
              <Text style={styles.warningText}>
                {lowStock.length} obat stok menipis
                {expired.length > 0 ? ` · ${expired.length} kadaluarsa` : ''}
                {nearExpiry.length > 0
                  ? ` · ${nearExpiry.length} mendekati kadaluarsa`
                  : ''}
              </Text>
            </View>
          ) : null}

          <SearchInput
            value={search}
            onChangeText={setSearch}
            placeholder="Cari nama atau kategori obat"
          />

          <View style={styles.list}>
            {filtered.map((medicine) => {
              const low = stokMenipis(medicine.stok, medicine.stokMinimum);
              const expiredItem = isKadaluarsa(medicine.kadaluarsa);
              const near = isHampirKadaluarsa(medicine.kadaluarsa);
              return (
                <Card key={medicine.id} style={styles.medCard}>
                  <View style={styles.medTop}>
                    <View
                      style={[
                        styles.medIcon,
                        { backgroundColor: low ? Colors.dangerLight : Colors.cyanLight },
                      ]}>
                      <Ionicons
                        name="flask-outline"
                        size={18}
                        color={low ? Colors.danger : Colors.cyan}
                      />
                    </View>
                    <View style={styles.medInfo}>
                      <Text style={styles.medName}>{medicine.nama}</Text>
                      <Text style={styles.medMeta}>
                        {medicine.kategori} · {medicine.satuan} ·{' '}
                        {formatRupiah(medicine.harga)}
                      </Text>
                      <View style={styles.medBadges}>
                        <Badge
                          label={`Stok ${medicine.stok}`}
                          tone={low ? 'danger' : 'success'}
                        />
                        <Badge
                          label={`Min. ${medicine.stokMinimum}`}
                          tone="neutral"
                        />
                        <Badge
                          label={`Exp ${formatBulan(medicine.kadaluarsa)}`}
                          tone={expiredItem ? 'danger' : near ? 'warning' : 'neutral'}
                        />
                      </View>
                    </View>
                  </View>
                  <View style={styles.medActions}>
                    <Button
                      title="Terima"
                      size="sm"
                      variant="secondary"
                      icon="arrow-down-circle-outline"
                      onPress={() => openModal(medicine.id, 'terima')}
                      style={styles.flexButton}
                    />
                    <Button
                      title="Keluar"
                      size="sm"
                      variant="secondary"
                      icon="arrow-up-circle-outline"
                      onPress={() => openModal(medicine.id, 'keluar')}
                      style={styles.flexButton}
                    />
                  </View>
                </Card>
              );
            })}
          </View>
        </>
      ) : (
        <View style={styles.list}>
          {resepList.length === 0 ? (
            <EmptyState
              icon="document-text-outline"
              title="Belum ada resep"
              description="Resep dari pemeriksaan dokter akan tampil di sini."
            />
          ) : (
            resepList.map((exam) => {
              const patient = patients.find((p) => p.id === exam.patientId);
              const cukup = exam.resep.every((r) => {
                const medicine = medicines.find((m) => m.id === r.medicineId);
                return medicine !== undefined && medicine.stok >= r.jumlah;
              });
              return (
                <Card key={exam.id} style={styles.resepCard}>
                  <View style={styles.resepTop}>
                    <View style={styles.avatar}>
                      <Text style={styles.avatarText}>
                        {inisial(patient?.nama ?? 'Pasien')}
                      </Text>
                    </View>
                    <View style={styles.medInfo}>
                      <Text style={styles.medName}>
                        {patient?.nama ?? 'Pasien'}
                      </Text>
                      <Text style={styles.medMeta}>
                        {formatTanggal(exam.tanggal)} · {exam.diagnosis}
                      </Text>
                    </View>
                    <Badge
                      label={exam.resepDiserahkan ? 'Diserahkan' : 'Belum'}
                      tone={exam.resepDiserahkan ? 'success' : 'warning'}
                    />
                  </View>
                  <View style={styles.resepLines}>
                    {exam.resep.map((item) => {
                      const medicine = medicines.find(
                        (m) => m.id === item.medicineId,
                      );
                      return (
                        <Text key={item.medicineId} style={styles.resepLine}>
                          • {medicine?.nama ?? 'Obat'} × {item.jumlah} —{' '}
                          {item.aturan}
                        </Text>
                      );
                    })}
                  </View>
                  {!cukup && !exam.resepDiserahkan ? (
                    <Text style={styles.stockWarning}>
                      Stok obat tidak mencukupi untuk resep ini.
                    </Text>
                  ) : null}
                  {!exam.resepDiserahkan ? (
                    <Button
                      title="Serahkan Obat"
                      size="sm"
                      icon="bag-check-outline"
                      disabled={!cukup}
                      onPress={() =>
                        Alert.alert(
                          'Serahkan Obat',
                          `Serahkan obat untuk ${patient?.nama}? Stok akan otomatis berkurang.`,
                          [
                            { text: 'Batal', style: 'cancel' },
                            {
                              text: 'Serahkan',
                              onPress: () => dispensePrescription(exam.id),
                            },
                          ],
                        )
                      }
                    />
                  ) : null}
                </Card>
              );
            })
          )}
        </View>
      )}

      <Modal
        visible={modal !== null}
        transparent
        animationType="fade"
        onRequestClose={closeModal}>
        <View style={styles.overlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>
              {modal?.mode === 'terima' ? 'Penerimaan Obat' : 'Pengeluaran Obat'}
            </Text>
            <Text style={styles.modalSubtitle}>{selected?.nama}</Text>
            <Text style={styles.modalStock}>
              Stok saat ini: {selected?.stok} {selected?.satuan}
            </Text>
            <Input
              label="Jumlah"
              value={qty}
              onChangeText={setQty}
              keyboardType="number-pad"
            />
            <View style={styles.modalActions}>
              <Button
                title="Batal"
                variant="secondary"
                onPress={closeModal}
                style={styles.flexButton}
              />
              <Button title="Simpan" onPress={confirmModal} style={styles.flexButton} />
            </View>
          </View>
        </View>
      </Modal>
    </Page>
  );
}

const styles = StyleSheet.create({
  warningBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.warningLight,
    borderRadius: Radius.md,
    padding: 12,
  },
  warningText: {
    flex: 1,
    fontSize: 11,
    fontWeight: '600',
    color: Colors.warning,
  },
  list: {
    gap: 10,
  },
  medCard: {
    gap: 10,
  },
  medTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  medIcon: {
    width: 38,
    height: 38,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  medInfo: {
    flex: 1,
    gap: 2,
  },
  medName: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.text,
  },
  medMeta: {
    fontSize: 11,
    color: Colors.textMuted,
  },
  medBadges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 5,
    marginTop: 5,
  },
  medActions: {
    flexDirection: 'row',
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: 10,
  },
  flexButton: {
    flex: 1,
  },
  resepCard: {
    gap: 10,
  },
  resepTop: {
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
  resepLines: {
    backgroundColor: Colors.background,
    borderRadius: Radius.md,
    padding: 10,
    gap: 4,
  },
  resepLine: {
    fontSize: 11,
    color: Colors.textSecondary,
    lineHeight: 16,
  },
  stockWarning: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.danger,
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
  modalSubtitle: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginTop: -6,
  },
  modalStock: {
    fontSize: 11,
    color: Colors.textMuted,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
});
