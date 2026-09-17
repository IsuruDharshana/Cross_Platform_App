import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { EventForm, type EventPayload } from '@/components/event-form';
import { LoadingView } from '@/components/ui-kit';
import { Palette } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { apiFetch } from '@/lib/api';
import type { EventItem } from '@/types';

export default function EditEventScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>(); const { token } = useAuth(); const router = useRouter(); const [event, setEvent] = useState<EventItem | null>(null); const [busy, setBusy] = useState(false);
  useEffect(() => { if (!id || !token) return; void apiFetch<{ events: EventItem[] }>('/organizer/events', {}, token).then((r) => setEvent(r.events.find((item) => item.id === id) ?? null)).catch(() => Alert.alert('Event unavailable', 'This event could not be loaded.')); }, [id, token]);
  const submit = async (payload: EventPayload) => { if (!id || !token) return; try { setBusy(true); await apiFetch(`/events/${id}`, { method: 'PUT', body: JSON.stringify(payload) }, token); Alert.alert('Changes saved', 'The event has been updated.'); router.replace('/my-events'); } catch (cause) { Alert.alert('Update failed', cause instanceof Error ? cause.message : 'Please try again.'); } finally { setBusy(false); } };
  return <View style={styles.screen}><View style={styles.header}><Text style={styles.title}>Edit Event</Text><Text style={styles.copy}>Update the event details below.</Text></View>{event ? <EventForm initial={event} actionLabel="Save Changes" busy={busy} onSubmit={submit} /> : <LoadingView label="Loading event" />}</View>;
}
const styles = StyleSheet.create({ screen: { flex: 1, backgroundColor: Palette.background }, header: { paddingHorizontal: 20, paddingTop: 20, width: '100%', maxWidth: 660, alignSelf: 'center' }, title: { color: Palette.text, fontSize: 28, fontWeight: '700' }, copy: { color: Palette.textSecondary, fontSize: 15, marginTop: 7 } });
