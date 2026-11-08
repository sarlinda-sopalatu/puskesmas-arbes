import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Colors, Radius } from '@/constants/theme';

type AppHeaderProps = {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  right?: ReactNode;
  onBack?: () => void;
};

export function AppHeader({ title, subtitle, showBack = true, right, onBack }: AppHeaderProps) {
  const router = useRouter();

  const handleBack = () => {
    if (onBack) {
      onBack();
      return;
    }
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/home');
    }
  };

  return (
    <View style={styles.header}>
      {showBack ? (
        <Pressable onPress={handleBack} hitSlop={10} style={styles.backButton}>
          <Ionicons name="arrow-back" size={22} color={Colors.text} />
        </Pressable>
      ) : (
        <View style={styles.backButton} />
      )}
      <View style={styles.titles}>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        {subtitle ? (
          <Text style={styles.subtitle} numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      <View style={styles.right}>{right}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: 4,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titles: {
    flex: 1,
    gap: 1,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.text,
  },
  subtitle: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  right: {
    minWidth: 40,
    alignItems: 'flex-end',
  },
});
