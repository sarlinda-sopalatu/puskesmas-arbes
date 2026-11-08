import { useState } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextInputProps,
} from 'react-native';

import { Colors, Radius } from '@/constants/theme';

type InputProps = TextInputProps & {
  label?: string;
  error?: string;
  helper?: string;
  required?: boolean;
};

export function Input({
  label,
  error,
  helper,
  required,
  multiline,
  style,
  onFocus,
  onBlur,
  ...rest
}: InputProps) {
  const [focused, setFocused] = useState(false);

  return (
    <View style={styles.wrapper}>
      {label ? (
        <Text style={styles.label}>
          {label}
          {required ? <Text style={styles.required}> *</Text> : null}
        </Text>
      ) : null}
      <View
        style={[
          styles.box,
          multiline && styles.boxMultiline,
          focused && styles.boxFocused,
          error && styles.boxError,
        ]}>
        <TextInput
          {...rest}
          multiline={multiline}
          placeholderTextColor={Colors.textMuted}
          style={[styles.input, multiline && styles.inputMultiline, style]}
          onFocus={(event) => {
            setFocused(true);
            onFocus?.(event);
          }}
          onBlur={(event) => {
            setFocused(false);
            onBlur?.(event);
          }}
        />
      </View>
      {error ? (
        <Text style={styles.error}>{error}</Text>
      ) : helper ? (
        <Text style={styles.helper}>{helper}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: 6,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  required: {
    color: Colors.danger,
  },
  box: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    paddingHorizontal: 14,
    minHeight: 48,
    justifyContent: 'center',
  },
  boxMultiline: {
    minHeight: 100,
    paddingVertical: 10,
    justifyContent: 'flex-start',
  },
  boxFocused: {
    borderColor: Colors.primary,
  },
  boxError: {
    borderColor: Colors.danger,
  },
  input: {
    fontSize: 15,
    color: Colors.text,
    padding: 0,
  },
  inputMultiline: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  error: {
    fontSize: 12,
    color: Colors.danger,
  },
  helper: {
    fontSize: 12,
    color: Colors.textMuted,
  },
});
