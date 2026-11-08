import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import { Page } from '@/components/page';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Colors, Radius, Shadow } from '@/constants/theme';
import { useAuth } from '@/lib/auth';
import { inisial } from '@/lib/format';
import { menuForRole, ROLE_LABEL } from '@/lib/roles';

export default function ProfilScreen() {
  const router = useRouter();
  const { user, logout } = useAuth();

  if (!user) return null;

  const modules = menuForRole(user.role);

  const handleLogout = () => {
    Alert.alert('Keluar Akun', 'Yakin ingin keluar dari aplikasi?', [
      { text: 'Batal', style: 'cancel' },
      {
        text: 'Keluar',
        style: 'destructive',
        onPress: async () => {
          await logout();
          router.replace('/login');
        },
      },
    ]);
  };

  return (
    <Page title="Profil" subtitle="Informasi akun dan pengaturan">
      <View style={styles.profileCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{inisial(user.name)}</Text>
        </View>
        <Text style={styles.name}>{user.name}</Text>
        <Text style={styles.username}>@{user.username}</Text>
        <View style={styles.badges}>
          <Badge label={ROLE_LABEL[user.role]} tone="primary" />
          {user.poli ? <Badge label={`Poli ${user.poli}`} tone="info" /> : null}
        </View>
      </View>

      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>Detail Akun</Text>
        <InfoRow label="Username" value={`@${user.username}`} />
        <InfoRow label="Peran" value={ROLE_LABEL[user.role]} />
        {user.poli ? <InfoRow label="Poli" value={user.poli} /> : null}
        <InfoRow label="Akses modul" value={`${modules.length} modul`} last />
      </Card>

      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>Pengaturan</Text>
        {user.role === 'admin' ? (
          <MenuRow
            icon="shield-checkmark-outline"
            title="Manajemen Pengguna"
            subtitle="Kelola akun, peran, dan reset password"
            onPress={() => router.push('/pengguna')}
          />
        ) : null}
        <MenuRow
          icon="information-circle-outline"
          title="Tentang Aplikasi"
          subtitle="Puskesmas Arbes v1.0.0"
          onPress={() =>
            Alert.alert(
              'Puskesmas Arbes',
              'Aplikasi layanan puskesmas untuk pendaftaran, antrean, pemeriksaan, farmasi, pembayaran, dan laporan.\n\nVersi 1.0.0 — demo UI/UX.',
            )
          }
        />
        <MenuRow
          icon="help-circle-outline"
          title="Bantuan & Dukungan"
          subtitle="Hubungi administrator puskesmas"
          onPress={() =>
            Alert.alert(
              'Bantuan',
              'Untuk bantuan teknis, hubungi administrator Puskesmas Arbes atau email support@puskesmasarbes.id.',
            )
          }
        />
        <MenuRow
          icon="lock-closed-outline"
          title="Kebijakan Privasi"
          subtitle="Perlindungan data pasien"
          onPress={() =>
            Alert.alert(
              'Kebijakan Privasi',
              'Data pasien hanya digunakan untuk pelayanan kesehatan dan dilindungi sesuai peraturan yang berlaku.',
            )
          }
          last
        />
      </Card>

      <Button
        title="Keluar dari Akun"
        variant="danger"
        icon="log-out-outline"
        onPress={handleLogout}
      />

      <Text style={styles.footer}>
        © 2026 Puskesmas Arbes · Dibangun dengan Expo
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

function MenuRow({
  icon,
  title,
  subtitle,
  onPress,
  last,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
  onPress: () => void;
  last?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.menuRow,
        !last && styles.menuRowBorder,
        pressed && styles.pressed,
      ]}>
      <View style={styles.menuIcon}>
        <Ionicons name={icon} size={18} color={Colors.primaryDark} />
      </View>
      <View style={styles.menuInfo}>
        <Text style={styles.menuTitle}>{title}</Text>
        <Text style={styles.menuSubtitle}>{subtitle}</Text>
      </View>
      <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  profileCard: {
    backgroundColor: Colors.primaryDark,
    borderRadius: Radius.lg,
    padding: 22,
    alignItems: 'center',
    gap: 3,
    ...Shadow.card,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: Radius.full,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  avatarText: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.primaryDark,
  },
  name: {
    fontSize: 19,
    fontWeight: '800',
    color: Colors.white,
  },
  username: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
  },
  badges: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 8,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  section: {
    gap: 10,
  },
  sectionTitle: {
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
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingBottom: 10,
  },
  menuRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  menuIcon: {
    width: 34,
    height: 34,
    borderRadius: Radius.sm,
    backgroundColor: Colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuInfo: {
    flex: 1,
    gap: 1,
  },
  menuTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.text,
  },
  menuSubtitle: {
    fontSize: 10,
    color: Colors.textMuted,
  },
  pressed: {
    opacity: 0.7,
  },
  footer: {
    textAlign: 'center',
    fontSize: 10,
    color: Colors.textMuted,
  },
});
