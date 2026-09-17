import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { EventCard } from '@/components/event-card';
import { EmptyState, PageIntro } from '@/components/ui-kit';
import { Palette } from '@/constants/theme';
import { apiFetch } from '@/lib/api';
import type { EventItem } from '@/types';

export default function ExploreScreen() {
  const router = useRouter(); const [events, setEvents] = useState<EventItem[]>([]); const [search, setSearch] = useState(''); const [selected, setSelected] = useState('All');
  useEffect(() => { void apiFetch<{ events: EventItem[] }>('/events').then((r) => setEvents(r.events)).catch(() => setEvents([])); }, []);
  const categories = useMemo(() => ['All', ...Array.from(new Set(events.map((e) => e.category)))], [events]);
  const visible = useMemo(() => events.filter((event) => (selected === 'All' || event.category === selected) && (!search || `${event.name} ${event.location} ${event.description}`.toLowerCase().includes(search.toLowerCase()))), [events, search, selected]);
  return <ScrollView style={styles.screen} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled"><View style={styles.inner}><PageIntro title="Explore" description="Search the full collection and filter it your way." /><TextInput style={styles.search} value={search} onChangeText={setSearch} placeholder="Search by event, place, or keyword" placeholderTextColor={Palette.textMuted} /><ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>{categories.map((item) => <Pressable key={item} onPress={() => setSelected(item)} style={[styles.chip, selected === item && styles.active]}><Text style={[styles.chipText, selected === item && styles.activeText]}>{item}</Text></Pressable>)}</ScrollView><View style={styles.countRow}><Text style={styles.count}>{visible.length} {visible.length === 1 ? 'event' : 'events'}</Text></View>{visible.length ? visible.map((event) => <EventCard key={event.id} event={event} onPress={() => router.push({ pathname: '/event/[id]', params: { id: event.id } })} />) : <EmptyState title="No events match" message="Clear the search or choose another category." />}</View></ScrollView>;
}
const styles = StyleSheet.create({ screen: { flex: 1, backgroundColor: Palette.background }, content: { padding: 20, paddingBottom: 34 }, inner: { width: '100%', maxWidth: 640, alignSelf: 'center' }, search: { height: 48, backgroundColor: Palette.card, borderWidth: 1, borderColor: Palette.borderStrong, borderRadius: 11, paddingHorizontal: 14, marginTop: 22, color: Palette.text, fontSize: 15 }, chips: { gap: 8, paddingTop: 13, paddingBottom: 20 }, chip: { backgroundColor: Palette.chip, borderRadius: 9, paddingHorizontal: 14, paddingVertical: 9 }, active: { backgroundColor: Palette.green }, chipText: { color: '#53645B', fontSize: 13, fontWeight: '600' }, activeText: { color: '#FFF' }, countRow: { borderTopWidth: 1, borderTopColor: Palette.border, paddingTop: 16, paddingBottom: 12 }, count: { color: Palette.textSecondary, fontSize: 13, fontWeight: '600' } });
