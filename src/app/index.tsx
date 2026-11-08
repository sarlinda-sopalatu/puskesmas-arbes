import { Ionicons } from '@expo/vector-icons';
import { Redirect } from 'expo-router';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { Colors } from '@/constants/theme';
import { useAuth } from '@/lib/auth';

export default function IndexScreen() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={styles.splash}>
        <View style={styles.logo}>
          <Ionicons name="medical" size={38} color={Colors.primary} />
        </View>
        <Text style={styles.brand}>Puskesmas Arbes</Text>
        <ActivityIndicator color={Colors.white} style={styles.loading} />
      </View>
    );
  }

  return user ? <Redirect href="/home" /> : <Redirect href="/login" />;
}

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  logo: {
    width: 84,
    height: 84,
    borderRadius: 24,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brand: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.white,
  },
  loading: {
    marginTop: 12,
  },
});
