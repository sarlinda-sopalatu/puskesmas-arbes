import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Colors } from '@/constants/theme';

type SectionTitleProps = {
  title: string;
  actionLabel?: string;
  onPressAction?: () => void;
};

export function SectionTitle({ title, actionLabel, onPressAction }: SectionTitleProps) {
  return (
    <View style={styles.row}>
      <Text style={styles.title}>{title}</Text>
      {actionLabel ? (
        <Pressable onPress={onPressAction} hitSlop={8}>
          <Text style={styles.action}>{actionLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.text,
  },
  action: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary,
  },
});
