import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { EventCard } from '@/components/event-card';
import { EmptyState, PageIntro, SectionHeading } from '@/components/ui-kit';
import { Palette } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { apiFetch } from '@/lib/api';
import type { EventItem } from '@/types';

export default function HomeScreen() {
  const { user } = useAuth(); const router = useRouter(); const [events, setEvents] = useState<EventItem[]>([]); const [query, setQuery] = useState(''); const [category, setCategory] = useState('All');
  useEffect(() => { void apiFetch<{ events: EventItem[] }>('/events').then((r) => setEvents(r.events)).catch(() => setEvents([])); }, []);
  const categories = useMemo(() => ['All', ...Array.from(new Set(events.map((event) => event.category)))], [events]);
  const filtered = useMemo(() => events.filter((event) => (category === 'All' || event.category === category) && (!query || `${event.name} ${event.location}`.toLowerCase().includes(query.toLowerCase()))), [category, events, query]);
  const open = (id: string) => router.push({ pathname: '/event/[id]', params: { id } });
  return <ScrollView style={styles.screen} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled"><View style={styles.inner}><PageIntro eyebrow={`Hello${user?.name ? `, ${user.name.split(' ')[0]}` : ''}`} title="Discover your next experience" description="Thoughtfully selected events, all in one place." /><View style={styles.searchWrap}><Text style={styles.searchIcon}>⌕</Text><TextInput value={query} onChangeText={setQuery} placeholder="Search events or places" placeholderTextColor={Palette.textMuted} style={styles.search} /></View><ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>{categories.map((item) => <Pressable key={item} onPress={() => setCategory(item)} style={[styles.chip, category === item && styles.chipActive]}><Text style={[styles.chipText, category === item && styles.chipTextActive]}>{item}</Text></Pressable>)}</ScrollView>
  <SectionHeading title="Popular events" action={<Pressable onPress={() => router.push('/explore')}><Text style={styles.link}>See all</Text></Pressable>} />{filtered.length ? <ScrollView horizontal showsHorizontalScrollIndicator={false}>{filtered.slice(0, 4).map((event) => <EventCard key={event.id} event={event} compact onPress={() => open(event.id)} />)}</ScrollView> : <EmptyState title="Nothing found" message="Try a different search or category." />}
  <SectionHeading title="Coming up" />{filtered.slice(1, 4).map((event) => <EventCard key={event.id} event={event} onPress={() => open(event.id)} />)}</View></ScrollView>;
}
const styles = StyleSheet.create({ screen: { flex: 1, backgroundColor: Palette.background }, content: { padding: 20, paddingBottom: 34 }, inner: { width: '100%', maxWidth: 720, alignSelf: 'center' }, searchWrap: { flexDirection: 'row', alignItems: 'center', height: 48, backgroundColor: Palette.card, borderWidth: 1, borderColor: Palette.border, borderRadius: 12, marginTop: 24, paddingHorizontal: 14 }, searchIcon: { color: Palette.green, fontSize: 22, marginRight: 9 }, search: { flex: 1, color: Palette.text, fontSize: 15 }, chips: { gap: 8, paddingTop: 14, paddingRight: 10 }, chip: { backgroundColor: Palette.chip, borderRadius: 9, paddingHorizontal: 14, paddingVertical: 9 }, chipActive: { backgroundColor: Palette.green }, chipText: { color: '#53645B', fontSize: 13, fontWeight: '600' }, chipTextActive: { color: '#FFF' }, link: { color: Palette.green, fontSize: 13, fontWeight: '700' } });
