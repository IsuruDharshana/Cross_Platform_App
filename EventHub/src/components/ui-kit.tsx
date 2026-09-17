import type { ReactNode } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, type TextInputProps, View, type ViewStyle } from 'react-native';
import { Palette } from '@/constants/theme';

export function Screen({ children, style }: { children: ReactNode; style?: ViewStyle }) {
  return <View style={[styles.screen, style]}>{children}</View>;
}
export function PageIntro({ eyebrow, title, description }: { eyebrow?: string; title: string; description?: string }) {
  return <View style={styles.intro}>{eyebrow ? <Text style={styles.eyebrow}>{eyebrow}</Text> : null}<Text style={styles.pageTitle}>{title}</Text>{description ? <Text style={styles.description}>{description}</Text> : null}</View>;
}
export function SectionHeading({ title, action }: { title: string; action?: ReactNode }) {
  return <View style={styles.sectionHeading}><Text style={styles.sectionTitle}>{title}</Text>{action}</View>;
}
export function Field({ label, ...props }: TextInputProps & { label: string }) {
  return <View style={styles.fieldWrap}><Text style={styles.fieldLabel}>{label}</Text><TextInput placeholderTextColor={Palette.textMuted} {...props} style={[styles.input, props.multiline && styles.multiline, props.style]} /></View>;
}
export function PrimaryButton({ label, onPress, disabled = false }: { label: string; onPress: () => void; disabled?: boolean }) {
  return <Pressable disabled={disabled} onPress={onPress} style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed, disabled && styles.disabled]}><Text style={styles.primaryButtonText}>{label}</Text></Pressable>;
}
export function SecondaryButton({ label, onPress }: { label: string; onPress: () => void }) {
  return <Pressable onPress={onPress} style={({ pressed }) => [styles.secondaryButton, pressed && styles.pressed]}><Text style={styles.secondaryButtonText}>{label}</Text></Pressable>;
}
export function EmptyState({ title, message }: { title: string; message: string }) {
  return <View style={styles.empty}><Text style={styles.emptyMark}>◇</Text><Text style={styles.emptyTitle}>{title}</Text><Text style={styles.emptyMessage}>{message}</Text></View>;
}
export function LoadingView({ label = 'Loading...' }: { label?: string }) {
  return <View style={styles.loading}><ActivityIndicator color={Palette.green} /><Text style={styles.loadingText}>{label}</Text></View>;
}
export function initials(name?: string) { return (name ?? 'EH').split(' ').filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase(); }

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Palette.background }, intro: { gap: 6 },
  eyebrow: { color: Palette.green, fontSize: 12, fontWeight: '700', letterSpacing: 1.2, textTransform: 'uppercase' },
  pageTitle: { color: Palette.text, fontSize: 28, lineHeight: 34, fontWeight: '700' },
  description: { color: Palette.textSecondary, fontSize: 15, lineHeight: 22, maxWidth: 520 },
  sectionHeading: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 28, marginBottom: 14 }, sectionTitle: { color: Palette.text, fontSize: 19, fontWeight: '700' },
  fieldWrap: { gap: 7, marginBottom: 16 }, fieldLabel: { color: Palette.text, fontSize: 13, fontWeight: '600' },
  input: { minHeight: 48, borderWidth: 1, borderColor: Palette.borderStrong, borderRadius: 11, backgroundColor: Palette.card, paddingHorizontal: 14, paddingVertical: 11, color: Palette.text, fontSize: 15 }, multiline: { minHeight: 104, textAlignVertical: 'top' },
  primaryButton: { minHeight: 48, borderRadius: 11, backgroundColor: Palette.green, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 18 }, primaryButtonText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
  secondaryButton: { minHeight: 42, borderRadius: 10, borderWidth: 1, borderColor: Palette.borderStrong, backgroundColor: Palette.card, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 16 }, secondaryButtonText: { color: Palette.green, fontSize: 14, fontWeight: '700' },
  pressed: { opacity: 0.76 }, disabled: { opacity: 0.55 },
  empty: { alignItems: 'center', paddingVertical: 42, paddingHorizontal: 24, gap: 7 }, emptyMark: { color: Palette.green, fontSize: 28 }, emptyTitle: { color: Palette.text, fontSize: 17, fontWeight: '700' }, emptyMessage: { color: Palette.textSecondary, fontSize: 14, lineHeight: 21, textAlign: 'center' },
  loading: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 32, gap: 10 }, loadingText: { color: Palette.textSecondary, fontSize: 14 },
});
