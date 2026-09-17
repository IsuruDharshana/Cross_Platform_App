import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { EventForm, type EventPayload } from '@/components/event-form';
import { Palette } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { apiFetch } from '@/lib/api';

export default function CreateEventScreen() {
  const { token } = useAuth(); const router = useRouter(); const [busy, setBusy] = useState(false);
  const submit = async (payload: EventPayload) => { if (!token) return; try { setBusy(true); await apiFetch('/events', { method: 'POST', body: JSON.stringify(payload) }, token); Alert.alert('Event created', 'Your event is now available in My Events.'); router.replace('/my-events'); } catch (cause) { Alert.alert('Could not create event', cause instanceof Error ? cause.message : 'Please check the details.'); } finally { setBusy(false); } };
  return <View style={styles.screen}><View style={styles.header}><Text style={styles.title}>Create Event</Text><Text style={styles.copy}>Add the essential details attendees need.</Text></View><EventForm actionLabel="Create Event" busy={busy} onSubmit={submit} /></View>;
}
const styles = StyleSheet.create({ screen: { flex: 1, backgroundColor: Palette.background }, header: { paddingHorizontal: 20, paddingTop: 20, width: '100%', maxWidth: 660, alignSelf: 'center' }, title: { color: Palette.text, fontSize: 28, fontWeight: '700' }, copy: { color: Palette.textSecondary, fontSize: 15, marginTop: 7 } });
