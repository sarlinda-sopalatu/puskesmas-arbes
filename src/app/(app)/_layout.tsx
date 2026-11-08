import { Redirect, Stack } from 'expo-router';

import { Colors } from '@/constants/theme';
import { useAuth } from '@/lib/auth';

export default function AppLayout() {
  const { user, loading } = useAuth();

  if (loading) {
    return null;
  }

  if (!user) {
    return <Redirect href="/login" />;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: Colors.background },
        animation: 'slide_from_right',
      }}
    />
  );
}
