import { Tabs } from 'expo-router';
import { StyleSheet, Text } from 'react-native';
import { Palette } from '@/constants/theme';

const icons: Record<string, string> = { dashboard: '▦', 'my-events': '☷', 'create-event': '+', 'organizer-profile': '○' };
export default function OrganizerTabs() {
  return <Tabs screenOptions={({ route }) => ({ headerShown: false, tabBarActiveTintColor: Palette.green, tabBarInactiveTintColor: '#8D9791', tabBarStyle: styles.bar, tabBarLabelStyle: styles.label, tabBarIcon: ({ color }) => <Text style={[styles.icon, { color }]}>{icons[route.name] ?? '·'}</Text> })}>
    <Tabs.Screen name="dashboard" options={{ title: 'Dashboard' }} /><Tabs.Screen name="my-events" options={{ title: 'My Events' }} /><Tabs.Screen name="create-event" options={{ title: 'Create Event' }} /><Tabs.Screen name="organizer-profile" options={{ title: 'Profile' }} /><Tabs.Screen name="edit-event/[id]" options={{ href: null }} /><Tabs.Screen name="event-bookings/[id]" options={{ href: null }} />
  </Tabs>;
}
const styles = StyleSheet.create({ bar: { height: 68, paddingTop: 7, paddingBottom: 8, backgroundColor: Palette.card, borderTopWidth: 1, borderTopColor: Palette.border }, label: { fontSize: 11, fontWeight: '600' }, icon: { fontSize: 21, lineHeight: 23 } });
