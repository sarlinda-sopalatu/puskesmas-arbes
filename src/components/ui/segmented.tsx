import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Colors, Radius } from '@/constants/theme';

type SegmentedProps = {
  options: { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
};

export function Segmented({ options, value, onChange }: SegmentedProps) {
  return (
    <View style={styles.wrapper}>
      {options.map((option) => {
        const active = option.value === value;
        return (
          <Pressable
            key={option.value}
            onPress={() => onChange(option.value)}
            style={[styles.item, active && styles.itemActive]}>
            <Text style={[styles.label, active && styles.labelActive]}>{option.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    backgroundColor: '#E2E8F0',
    borderRadius: Radius.md,
    padding: 3,
    gap: 3,
  },
  item: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: Radius.sm,
    alignItems: 'center',
  },
  itemActive: {
    backgroundColor: Colors.surface,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  labelActive: {
    color: Colors.text,
    fontWeight: '700',
  },
});
