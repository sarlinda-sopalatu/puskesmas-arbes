import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Colors, Radius } from '@/constants/theme';
import type { MenuItem } from '@/lib/roles';

type MenuGridProps = {
  items: MenuItem[];
};

export function MenuGrid({ items }: MenuGridProps) {
  const router = useRouter();

  return (
    <View style={styles.grid}>
      {items.map((item) => (
        <Pressable
          key={item.key}
          onPress={() => router.push(item.route as never)}
          style={({ pressed }) => [styles.tile, pressed && styles.pressed]}>
          <View style={[styles.iconWrap, { backgroundColor: item.bg }]}>
            <Ionicons name={item.icon} size={22} color={item.color} />
          </View>
          <Text style={styles.label} numberOfLines={2}>
            {item.label}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  tile: {
    width: '31%',
    minWidth: 90,
    flexGrow: 1,
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingVertical: 14,
    paddingHorizontal: 8,
    alignItems: 'center',
    gap: 8,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  pressed: {
    opacity: 0.8,
  },
});
