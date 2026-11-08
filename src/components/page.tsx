import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import { AppHeader } from '@/components/app-header';
import { Colors } from '@/constants/theme';

type PageProps = {
  title: string;
  subtitle?: string;
  right?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  scroll?: boolean;
  background?: string;
};

export function Page({
  title,
  subtitle,
  right,
  children,
  footer,
  scroll = true,
  background = Colors.background,
}: PageProps) {
  const insets = useSafeAreaInsets();

  return (
    <SafeAreaView
      style={[styles.safe, { backgroundColor: background }]}
      edges={['top', 'left', 'right']}>
      <StatusBar style="dark" />
      <AppHeader title={title} subtitle={subtitle} right={right} />
      {scroll ? (
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          {children}
        </ScrollView>
      ) : (
        <View style={styles.flex}>{children}</View>
      )}
      {footer ? (
        <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 12) }]}>
          {footer}
        </View>
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 32,
    gap: 16,
  },
  footer: {
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
});
