import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { Colors, Radius } from '@/constants/theme';

type EmptyStateProps = {
  icon?: keyof typeof Ionicons.glyphMap;
  title: string;
  description?: string;
};

export function EmptyState({ icon = 'file-tray-outline', title, description }: EmptyStateProps) {
  return (
    <View style={styles.wrapper}>
      <View style={styles.iconWrap}>
        <Ionicons name={icon} size={26} color={Colors.textMuted} />
      </View>
      <Text style={styles.title}>{title}</Text>
      {description ? <Text style={styles.description}>{description}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
    paddingHorizontal: 24,
    gap: 6,
  },
  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: Radius.full,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  description: {
    fontSize: 12,
    color: Colors.textMuted,
    textAlign: 'center',
  },
});
