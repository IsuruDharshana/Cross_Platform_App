import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { Palette } from '@/constants/theme';
import type { EventItem } from '@/types';

export function EventCard({ event, compact = false, onPress }: { event: EventItem; compact?: boolean; onPress: () => void }) {
  return <Pressable onPress={onPress} style={({ pressed }) => [styles.card, compact && styles.compactCard, pressed && styles.pressed]}>
    <Image source={{ uri: event.image }} style={[styles.image, compact && styles.compactImage]} />
    <View style={styles.body}><View style={styles.badge}><Text style={styles.badgeText}>{event.category}</Text></View><Text numberOfLines={2} style={styles.title}>{event.name}</Text><Text style={styles.meta}>{event.date} · {event.time}</Text><Text numberOfLines={1} style={styles.meta}>{event.location}</Text><View style={styles.footer}><Text style={styles.price}>LKR {event.price.toLocaleString()}</Text><Text style={styles.seats}>{event.availableSeats} seats</Text></View></View>
  </Pressable>;
}
const styles = StyleSheet.create({
  card: { width: '100%', backgroundColor: Palette.card, borderRadius: 15, borderWidth: 1, borderColor: Palette.border, overflow: 'hidden', marginBottom: 14, shadowColor: '#15251C', shadowOpacity: 0.04, shadowRadius: 8, shadowOffset: { width: 0, height: 3 }, elevation: 1 }, compactCard: { width: 248, marginRight: 14, marginBottom: 0 },
  image: { width: '100%', height: 162, backgroundColor: Palette.chip }, compactImage: { height: 126 }, body: { padding: 14 }, badge: { alignSelf: 'flex-start', backgroundColor: Palette.greenSoft, borderRadius: 7, paddingHorizontal: 8, paddingVertical: 4, marginBottom: 9 }, badgeText: { color: Palette.green, fontSize: 11, fontWeight: '700' }, title: { color: Palette.text, fontSize: 17, lineHeight: 22, fontWeight: '700', marginBottom: 7 }, meta: { color: Palette.textSecondary, fontSize: 13, lineHeight: 19 }, footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, paddingTop: 11, borderTopWidth: 1, borderTopColor: Palette.border }, price: { color: Palette.greenDark, fontSize: 14, fontWeight: '700' }, seats: { color: Palette.textMuted, fontSize: 12 }, pressed: { opacity: 0.82 },
});
