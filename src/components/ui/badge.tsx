import { StyleSheet, Text, View } from 'react-native';

import { Colors, Radius } from '@/constants/theme';

export type BadgeTone =
  | 'primary'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'neutral'
  | 'purple';

type BadgeProps = {
  label: string;
  tone?: BadgeTone;
};

const TONE_STYLES: Record<BadgeTone, { bg: string; text: string }> = {
  primary: { bg: Colors.primaryLight, text: Colors.primaryDark },
  success: { bg: Colors.successLight, text: Colors.success },
  warning: { bg: Colors.warningLight, text: Colors.warning },
  danger: { bg: Colors.dangerLight, text: Colors.danger },
  info: { bg: Colors.infoLight, text: Colors.info },
  neutral: { bg: '#F1F5F9', text: Colors.textSecondary },
  purple: { bg: Colors.purpleLight, text: Colors.purple },
};

export function Badge({ label, tone = 'neutral' }: BadgeProps) {
  const palette = TONE_STYLES[tone];
  return (
    <View style={[styles.badge, { backgroundColor: palette.bg }]}>
      <Text style={[styles.text, { color: palette.text }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    paddingVertical: 3,
    paddingHorizontal: 9,
    borderRadius: Radius.full,
  },
  text: {
    fontSize: 11,
    fontWeight: '700',
  },
});
