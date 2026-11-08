import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, Pressable, StyleSheet, Text, type StyleProp, type ViewStyle } from 'react-native';

import { Colors, Radius } from '@/constants/theme';

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost' | 'white';
type Size = 'md' | 'sm';

type ButtonProps = {
  title: string;
  onPress?: () => void;
  variant?: Variant;
  size?: Size;
  icon?: keyof typeof Ionicons.glyphMap;
  disabled?: boolean;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
};

const BG: Record<Variant, string> = {
  primary: Colors.primary,
  secondary: Colors.surface,
  danger: Colors.danger,
  ghost: 'transparent',
  white: Colors.white,
};

const TEXT: Record<Variant, string> = {
  primary: Colors.white,
  secondary: Colors.text,
  danger: Colors.white,
  ghost: Colors.primary,
  white: Colors.primaryDark,
};

const BORDER: Record<Variant, string> = {
  primary: Colors.primary,
  secondary: Colors.borderStrong,
  danger: Colors.danger,
  ghost: 'transparent',
  white: Colors.white,
};

export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  icon,
  disabled = false,
  loading = false,
  style,
}: ButtonProps) {
  const isDisabled = disabled || loading;
  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        size === 'sm' && styles.sm,
        {
          backgroundColor: BG[variant],
          borderColor: BORDER[variant],
        },
        pressed && !isDisabled && styles.pressed,
        isDisabled && styles.disabled,
        style,
      ]}>
      {loading ? (
        <ActivityIndicator size="small" color={TEXT[variant]} />
      ) : (
        <>
          {icon ? <Ionicons name={icon} size={18} color={TEXT[variant]} /> : null}
          <Text
            style={[
              styles.text,
              size === 'sm' && styles.textSm,
              { color: TEXT[variant] },
            ]}>
            {title}
          </Text>
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: Radius.md,
    borderWidth: 1,
    minHeight: 50,
  },
  sm: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    minHeight: 36,
    borderRadius: Radius.sm,
  },
  text: {
    fontSize: 15,
    fontWeight: '700',
  },
  textSm: {
    fontSize: 13,
  },
  pressed: {
    opacity: 0.85,
  },
  disabled: {
    opacity: 0.5,
  },
});
