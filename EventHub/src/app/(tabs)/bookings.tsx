import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { EmptyState, PageIntro, PrimaryButton } from '@/components/ui-kit';
import { Palette } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { apiFetch } from '@/lib/api';
import type { Booking, BookingStatus } from '@/types';

const statusStyle = (status: BookingStatus) => {
  if (status === 'CONFIRMED') return styles.confirmed;
  if (status === 'CANCELLED') return styles.cancelled;
  return styles.completed;
};

export default function BookingsScreen() {
  const { token } = useAuth();
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancelTarget, setCancelTarget] = useState<Booking | null>(null);
  const [cancelling, setCancelling] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [error, setError] = useState('');

  const loadBookings = async () => {
    if (!token) return;
    const result = await apiFetch<{ bookings: Booking[] }>('/bookings/my', {}, token);
    setBookings(result.bookings);
  };

  useEffect(() => {
    if (!token) return;
    let active = true;

    void apiFetch<{ bookings: Booking[] }>('/bookings/my', {}, token)
      .then((result) => {
        if (active) setBookings(result.bookings);
      })
      .catch((cause) => {
        if (active) setError(cause instanceof Error ? cause.message : 'Bookings could not be loaded.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [token]);

  const confirmCancellation = async () => {
    if (!cancelTarget || !token) return;

    try {
      setCancelling(true);
      setError('');
      await apiFetch(`/bookings/${cancelTarget.id}/cancel`, { method: 'PATCH' }, token);
      await loadBookings();
      setCancelTarget(null);
      setFeedback('Booking cancelled. The reserved seats have been released.');
    } catch (cause) {
      setCancelTarget(null);
      setError(cause instanceof Error ? cause.message : 'The booking could not be cancelled.');
    } finally {
      setCancelling(false);
    }
  };

  return (
    <>
      <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
        <View style={styles.inner}>
          <PageIntro title="My bookings" description="Your tickets and reservation history." />

          {feedback ? (
            <View style={styles.successBanner}>
              <Text style={styles.successText}>{feedback}</Text>
              <Pressable onPress={() => setFeedback('')}>
                <Text style={styles.dismiss}>×</Text>
              </Pressable>
            </View>
          ) : null}

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          {!loading && bookings.length === 0 ? (
            <EmptyState
              title="No bookings yet"
              message="When you reserve an event, your tickets will appear here."
            />
          ) : (
            <View style={styles.list}>
              {bookings.map((booking) => (
                <View key={booking.id} style={styles.card}>
                  <View style={styles.cardTop}>
                    <View style={styles.dateBox}>
                      <Text style={styles.dateDay}>{booking.event?.date?.slice(8, 10) ?? '—'}</Text>
                      <Text style={styles.dateMonth}>
                        {booking.event?.date
                          ? new Date(`${booking.event.date}T00:00:00`)
                              .toLocaleString('en', { month: 'short' })
                              .toUpperCase()
                          : ''}
                      </Text>
                    </View>

                    <View style={styles.info}>
                      <Text style={styles.name}>{booking.event?.name ?? 'Event booking'}</Text>
                      <Text style={styles.meta}>
                        {booking.event?.date ?? 'Date unavailable'} · {booking.numberOfSeats}{' '}
                        ticket{booking.numberOfSeats === 1 ? '' : 's'}
                      </Text>
                    </View>

                    <View style={[styles.status, statusStyle(booking.status)]}>
                      <Text
                        style={[
                          styles.statusText,
                          booking.status === 'CANCELLED' && styles.cancelledText,
                        ]}>
                        {booking.status}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.cardBottom}>
                    <Text style={styles.total}>LKR {booking.totalAmount.toLocaleString()}</Text>
                    <View style={styles.cardActions}>
                      <Pressable
                        onPress={() =>
                          router.push({ pathname: '/booking/[id]', params: { id: booking.id } })
                        }>
                        <Text style={styles.view}>Details</Text>
                      </Pressable>
                      {booking.status === 'CONFIRMED' ? (
                        <Pressable onPress={() => setCancelTarget(booking)}>
                          <Text style={styles.cancel}>Cancel</Text>
                        </Pressable>
                      ) : null}
                    </View>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      <Modal
        transparent
        visible={Boolean(cancelTarget)}
        animationType="fade"
        onRequestClose={() => setCancelTarget(null)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.warningMark}>
              <Text style={styles.warningMarkText}>!</Text>
            </View>
            <Text style={styles.modalTitle}>Cancel this booking?</Text>
            <Text style={styles.modalCopy}>
              {cancelTarget
                ? `${cancelTarget.numberOfSeats} ticket${cancelTarget.numberOfSeats === 1 ? '' : 's'} for ${cancelTarget.event?.name ?? 'this event'} will be cancelled.`
                : ''}
            </Text>
            <Pressable
              disabled={cancelling}
              onPress={() => void confirmCancellation()}
              style={[styles.destructiveButton, cancelling && styles.disabled]}>
              <Text style={styles.destructiveText}>
                {cancelling ? 'Cancelling...' : 'Cancel booking'}
              </Text>
            </Pressable>
            <View style={styles.keepButton}>
              <PrimaryButton label="Keep booking" onPress={() => setCancelTarget(null)} />
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Palette.background },
  content: { padding: 20, paddingBottom: 34 },
  inner: { width: '100%', maxWidth: 640, alignSelf: 'center' },
  list: { marginTop: 24, gap: 12 },
  successBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Palette.greenSoft,
    borderWidth: 1,
    borderColor: Palette.borderStrong,
    borderRadius: 11,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginTop: 20,
  },
  successText: { flex: 1, color: Palette.greenDark, fontSize: 13, fontWeight: '600' },
  dismiss: { color: Palette.green, fontSize: 22, marginLeft: 12 },
  errorText: { color: Palette.error, fontSize: 13, marginTop: 18 },
  card: {
    backgroundColor: Palette.card,
    borderWidth: 1,
    borderColor: Palette.border,
    borderRadius: 15,
    padding: 16,
  },
  cardTop: { flexDirection: 'row', alignItems: 'flex-start' },
  dateBox: {
    width: 48,
    height: 50,
    backgroundColor: Palette.greenSoft,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateDay: { color: Palette.greenDark, fontSize: 17, fontWeight: '700' },
  dateMonth: { color: Palette.green, fontSize: 9, fontWeight: '700' },
  info: { flex: 1, marginLeft: 12, paddingRight: 8 },
  name: { color: Palette.text, fontSize: 16, fontWeight: '700' },
  meta: { color: Palette.textSecondary, fontSize: 12, marginTop: 5 },
  status: { borderRadius: 7, paddingHorizontal: 7, paddingVertical: 5 },
  confirmed: { backgroundColor: Palette.greenSoft },
  cancelled: { backgroundColor: Palette.errorSoft },
  completed: { backgroundColor: Palette.chip },
  statusText: { color: Palette.greenDark, fontSize: 9, fontWeight: '700' },
  cancelledText: { color: Palette.error },
  cardBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: Palette.border,
    marginTop: 14,
    paddingTop: 13,
  },
  cardActions: { flexDirection: 'row', gap: 15 },
  total: { color: Palette.text, fontSize: 14, fontWeight: '700' },
  view: { color: Palette.green, fontSize: 13, fontWeight: '700' },
  cancel: { color: Palette.error, fontSize: 13, fontWeight: '700' },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(20, 32, 25, 0.46)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  modalCard: {
    width: '100%',
    maxWidth: 390,
    backgroundColor: Palette.card,
    borderRadius: 16,
    padding: 24,
  },
  warningMark: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Palette.errorSoft,
  },
  warningMarkText: { color: Palette.error, fontSize: 24, fontWeight: '700' },
  modalTitle: {
    color: Palette.text,
    fontSize: 21,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 16,
  },
  modalCopy: {
    color: Palette.textSecondary,
    fontSize: 14,
    lineHeight: 21,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 22,
  },
  destructiveButton: {
    minHeight: 46,
    borderRadius: 11,
    backgroundColor: Palette.error,
    alignItems: 'center',
    justifyContent: 'center',
  },
  destructiveText: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },
  keepButton: { marginTop: 10 },
  disabled: { opacity: 0.55 },
});
