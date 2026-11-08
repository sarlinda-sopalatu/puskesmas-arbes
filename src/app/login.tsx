import { Ionicons } from '@expo/vector-icons';
import { Redirect } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Colors, Radius } from '@/constants/theme';
import { useAuth } from '@/lib/auth';
import { useData } from '@/lib/data';
import { inisial } from '@/lib/format';
import { ROLE_LABEL } from '@/lib/roles';
import { DEMO_USERNAMES } from '@/lib/seed';

export default function LoginScreen() {
  const { user, login } = useAuth();
  const { users } = useData();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (user) {
    return <Redirect href="/home" />;
  }

  const accounts = users.filter(
    (u) => DEMO_USERNAMES.includes(u.username) && u.active,
  );

  const handleLogin = async () => {
    if (!username.trim() || !password) {
      setError('Username dan password wajib diisi.');
      return;
    }
    setLoading(true);
    setError('');
    const result = await login(username, password);
    setLoading(false);
    if (!result.ok) {
      setError(result.error ?? 'Gagal masuk. Silakan coba lagi.');
    }
  };

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <SafeAreaView edges={['top']} style={styles.heroSafe}>
        <View style={styles.hero}>
          <View style={styles.logo}>
            <Ionicons name="medical" size={34} color={Colors.primary} />
          </View>
          <Text style={styles.brand}>Puskesmas Arbes</Text>
          <Text style={styles.tagline}>Sistem Informasi Pelayanan Puskesmas</Text>
        </View>
      </SafeAreaView>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Masuk ke Akun</Text>
            <Text style={styles.cardSubtitle}>
              Gunakan akun petugas yang telah terdaftar.
            </Text>

            <Input
              label="Username"
              placeholder="contoh: admin"
              autoCapitalize="none"
              autoCorrect={false}
              value={username}
              onChangeText={(value) => {
                setUsername(value);
                setError('');
              }}
            />
            <Input
              label="Password"
              placeholder="Masukkan password"
              secureTextEntry
              value={password}
              onChangeText={(value) => {
                setPassword(value);
                setError('');
              }}
            />

            {error ? (
              <View style={styles.errorBox}>
                <Ionicons name="alert-circle" size={16} color={Colors.danger} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            <Button
              title="Masuk"
              icon="log-in-outline"
              onPress={handleLogin}
              loading={loading}
            />

            <Pressable
              onPress={() =>
                Alert.alert(
                  'Lupa Password',
                  'Untuk mereset password, hubungi administrator puskesmas. Administrator dapat mereset password melalui menu Manajemen Pengguna.',
                )
              }>
              <Text style={styles.forgot}>Lupa password?</Text>
            </Pressable>
          </View>

          <View style={styles.demoCard}>
            <Text style={styles.demoTitle}>Akun Demo — ketuk untuk isi otomatis</Text>
            <View style={styles.demoGrid}>
              {accounts.map((account) => (
                <Pressable
                  key={account.id}
                  onPress={() => {
                    setUsername(account.username);
                    setPassword(account.password);
                    setError('');
                  }}
                  style={({ pressed }) => [
                    styles.demoChip,
                    pressed && styles.pressed,
                  ]}>
                  <View style={styles.demoAvatar}>
                    <Text style={styles.demoAvatarText}>{inisial(account.name)}</Text>
                  </View>
                  <View style={styles.demoInfo}>
                    <Text style={styles.demoRole} numberOfLines={1}>
                      {ROLE_LABEL[account.role]}
                    </Text>
                    <Text style={styles.demoUser}>{account.username}</Text>
                  </View>
                </Pressable>
              ))}
            </View>
          </View>

          <Text style={styles.footer}>© 2026 Puskesmas Arbes · v1.0.0</Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.primary,
  },
  flex: {
    flex: 1,
  },
  heroSafe: {
    backgroundColor: Colors.primary,
  },
  hero: {
    alignItems: 'center',
    paddingTop: 22,
    paddingBottom: 44,
    paddingHorizontal: 24,
    gap: 8,
  },
  logo: {
    width: 76,
    height: 76,
    borderRadius: 22,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  brand: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.white,
    letterSpacing: 0.2,
  },
  tagline: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.85)',
    textAlign: 'center',
  },
  scroll: {
    backgroundColor: Colors.background,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    marginTop: -20,
    padding: 20,
    paddingBottom: 32,
    gap: 16,
    flexGrow: 1,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: 18,
    gap: 14,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.text,
  },
  cardSubtitle: {
    fontSize: 13,
    color: Colors.textMuted,
    marginTop: -8,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.dangerLight,
    borderRadius: Radius.sm,
    padding: 10,
  },
  errorText: {
    flex: 1,
    fontSize: 12,
    color: Colors.danger,
    fontWeight: '600',
  },
  forgot: {
    textAlign: 'center',
    fontSize: 13,
    fontWeight: '600',
    color: Colors.primaryDark,
  },
  demoCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  demoTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  demoGrid: {
    gap: 8,
  },
  demoChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: Radius.md,
    backgroundColor: Colors.background,
  },
  demoAvatar: {
    width: 34,
    height: 34,
    borderRadius: Radius.full,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  demoAvatarText: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.primaryDark,
  },
  demoInfo: {
    flex: 1,
  },
  demoRole: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.text,
  },
  demoUser: {
    fontSize: 11,
    color: Colors.textMuted,
  },
  pressed: {
    opacity: 0.75,
  },
  footer: {
    textAlign: 'center',
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 4,
  },
});
