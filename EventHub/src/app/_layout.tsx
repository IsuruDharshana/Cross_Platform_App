import { Slot, useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { Palette } from '@/constants/theme';

function AppShell() {
  const { user, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    const area = segments[0];
    const inAuth = area === '(auth)';
    const inCustomer = area === '(tabs)' || area === 'event' || area === 'booking';
    const inOrganizer = area === '(organizer)';

    if (!user && !inAuth) {
      router.replace('/login' as never);
    } else if (user?.role === 'USER' && (inAuth || inOrganizer || area === 'organizer')) {
      router.replace('/' as never);
    } else if (user?.role === 'ORGANIZER' && (inAuth || inCustomer || area === 'organizer')) {
      router.replace('/dashboard' as never);
    }
  }, [loading, router, segments, user]);

  if (loading) return <View style={styles.loading}><ActivityIndicator size="large" color={Palette.green} /></View>;
  return <Slot />;
}

export default function RootLayout() {
  return <AuthProvider><AppShell /></AuthProvider>;
}
const styles = StyleSheet.create({ loading: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Palette.background } });
