import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  Modal,
  Pressable,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';

import { Page } from '@/components/page';
import { SectionTitle } from '@/components/section-title';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Colors, Radius } from '@/constants/theme';
import { useAuth } from '@/lib/auth';
import { useData } from '@/lib/data';
import { inisial } from '@/lib/format';
import { MENU_ITEMS, ROLE_LABEL } from '@/lib/roles';
import type { Role } from '@/lib/types';

export default function PenggunaScreen() {
  const router = useRouter();
  const { user: currentUser } = useAuth();
  const { users, toggleUserActive, resetPassword } = useData();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const selected = users.find((u) => u.id === selectedId);
  const aktif = users.filter((u) => u.active).length;
  const nonaktif = users.length - aktif;

  const handleReset = () => {
    if (!selected) return;
    Alert.alert(
      'Reset Password',
      `Reset password ${selected.name} menjadi "123456"?`,
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Reset',
          onPress: () => {
            resetPassword(selected.id);
            setSelectedId(null);
            Alert.alert(
              'Password Direset',
              `Password sementara untuk @${selected.username} adalah 123456.`,
            );
          },
        },
      ],
    );
  };

  const handleToggle = () => {
    if (!selected) return;
    if (selected.id === currentUser?.id) {
      Alert.alert('Tidak Diizinkan', 'Anda tidak dapat menonaktifkan akun sendiri.');
      return;
    }
    toggleUserActive(selected.id);
    setSelectedId(null);
  };

  const handleSwitch = (id: string) => {
    if (id === currentUser?.id) {
      Alert.alert('Tidak Diizinkan', 'Anda tidak dapat menonaktifkan akun sendiri.');
      return;
    }
    toggleUserActive(id);
  };

  return (
    <Page
      title="Manajemen Pengguna"
      subtitle={`${users.length} akun terdaftar`}
      right={
        <Pressable
          onPress={() => router.push('/pengguna/baru')}
          hitSlop={8}
          style={styles.addButton}>
          <Ionicons name="add" size={22} color={Colors.white} />
        </Pressable>
      }
      footer={
        <Button
          title="Tambah Pengguna"
          icon="person-add-outline"
          onPress={() => router.push('/pengguna/baru')}
        />
      }>
      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{users.length}</Text>
          <Text style={styles.statLabel}>Total Akun</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={[styles.statValue, { color: Colors.success }]}>{aktif}</Text>
          <Text style={styles.statLabel}>Aktif</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={[styles.statValue, { color: Colors.danger }]}>
            {nonaktif}
          </Text>
          <Text style={styles.statLabel}>Nonaktif</Text>
        </View>
      </View>

      <View style={styles.list}>
        {users.map((user) => (
          <Card key={user.id} style={styles.userCard}>
            <View style={styles.userTop}>
              <View
                style={[styles.avatar, !user.active && styles.avatarInactive]}>
                <Text
                  style={[
                    styles.avatarText,
                    !user.active && { color: Colors.textMuted },
                  ]}>
                  {inisial(user.name)}
                </Text>
              </View>
              <View style={styles.info}>
                <Text style={styles.name}>{user.name}</Text>
                <Text style={styles.meta}>
                  @{user.username} · {ROLE_LABEL[user.role]}
                  {user.poli ? ` (${user.poli})` : ''}
                </Text>
                <View style={styles.badgeRow}>
                  <Badge
                    label={user.active ? 'Aktif' : 'Nonaktif'}
                    tone={user.active ? 'success' : 'neutral'}
                  />
                  {user.id === currentUser?.id ? (
                    <Badge label="Akun Anda" tone="primary" />
                  ) : null}
                </View>
              </View>
              <Switch
                value={user.active}
                onValueChange={() => handleSwitch(user.id)}
                trackColor={{
                  false: Colors.border,
                  true: Colors.primaryLight,
                }}
                thumbColor={user.active ? Colors.primary : Colors.surface}
              />
            </View>
            <Pressable
              onPress={() => setSelectedId(user.id)}
              style={styles.moreRow}>
              <Text style={styles.moreText}>Kelola akun</Text>
              <Ionicons
                name="chevron-forward"
                size={16}
                color={Colors.textMuted}
              />
            </Pressable>
          </Card>
        ))}
      </View>

      <SectionTitle title="Hak Akses per Peran" />
      <Card style={styles.accessCard}>
        {(Object.keys(ROLE_LABEL) as Role[]).map((role) => {
          const modules = MENU_ITEMS.filter((m) => m.roles.includes(role));
          return (
            <View key={role} style={styles.accessRow}>
              <Text style={styles.accessRole}>{ROLE_LABEL[role]}</Text>
              <Text style={styles.accessModules}>
                {modules.length} modul
              </Text>
            </View>
          );
        })}
      </Card>

      <Modal
        visible={selected !== undefined}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedId(null)}>
        <View style={styles.overlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {inisial(selected?.name ?? '')}
                </Text>
              </View>
              <View style={styles.info}>
                <Text style={styles.name}>{selected?.name}</Text>
                <Text style={styles.meta}>
                  @{selected?.username} ·{' '}
                  {selected ? ROLE_LABEL[selected.role] : ''}
                </Text>
              </View>
            </View>

            <View style={styles.modalActions}>
              <Button
                title="Reset Password"
                variant="secondary"
                icon="key-outline"
                onPress={handleReset}
              />
              <Button
                title={selected?.active ? 'Nonaktifkan Akun' : 'Aktifkan Akun'}
                variant={selected?.active ? 'danger' : 'primary'}
                icon={selected?.active ? 'ban-outline' : 'checkmark-circle-outline'}
                onPress={handleToggle}
              />
              <Button
                title="Tutup"
                variant="ghost"
                onPress={() => setSelectedId(null)}
              />
            </View>
          </View>
        </View>
      </Modal>
    </Page>
  );
}

const styles = StyleSheet.create({
  addButton: {
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
  },
  statValue: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.text,
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.textMuted,
  },
  list: {
    gap: 10,
  },
  userCard: {
    gap: 10,
  },
  userTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: Radius.full,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInactive: {
    backgroundColor: Colors.background,
  },
  avatarText: {
    fontSize: 13,
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
  badgeRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 4,
  },
  moreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: 8,
  },
  moreText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.primaryDark,
  },
  accessCard: {
    gap: 8,
  },
  accessRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  accessRole: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  accessModules: {
    fontSize: 11,
    fontWeight: '700',
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
    gap: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  modalActions: {
    gap: 8,
  },
});
