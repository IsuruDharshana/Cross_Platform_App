import { Tabs } from 'expo-router';
import { StyleSheet, Text } from 'react-native';
import { Palette } from '@/constants/theme';

const icons: Record<string, string> = { index: '⌂', explore: '⌕', bookings: '▣', profile: '○' };

export default function UserTabs() {
  return <Tabs screenOptions={({ route }) => ({
    headerShown: false,
    tabBarActiveTintColor: Palette.green,
    tabBarInactiveTintColor: '#8D9791',
    tabBarLabelStyle: styles.label,
    tabBarStyle: styles.bar,
    tabBarIcon: ({ color }) => <Text style={[styles.icon, { color }]}>{icons[route.name]}</Text>,
  })}>
    <Tabs.Screen name="index" options={{ title: 'Home' }} />
    <Tabs.Screen name="explore" options={{ title: 'Explore' }} />
    <Tabs.Screen name="bookings" options={{ title: 'Bookings' }} />
    <Tabs.Screen name="profile" options={{ title: 'Profile' }} />
  </Tabs>;
}
const styles = StyleSheet.create({ bar: { height: 68, paddingTop: 7, paddingBottom: 8, backgroundColor: Palette.card, borderTopColor: Palette.border, borderTopWidth: 1 }, label: { fontSize: 11, fontWeight: '600' }, icon: { fontSize: 21, lineHeight: 23 } });
