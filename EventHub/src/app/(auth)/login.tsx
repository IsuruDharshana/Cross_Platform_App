import { Link, useRouter } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Field, PrimaryButton } from '@/components/ui-kit';
import { Palette } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';

export default function LoginScreen() {
  const { login } = useAuth(); const router = useRouter();
  const [email, setEmail] = useState('user@eventhub.com'); const [password, setPassword] = useState('User12345');
  const [submitting, setSubmitting] = useState(false); const [error, setError] = useState('');
  const submit = async () => {
    if (!email.trim() || !password) return setError('Enter your email and password.');
    try { setSubmitting(true); setError(''); await login(email.trim(), password); router.replace('/' as never); }
    catch (cause) { setError(cause instanceof Error ? cause.message : 'Unable to sign in.'); }
    finally { setSubmitting(false); }
  };
  return <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === 'ios' ? 'padding' : undefined}><ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled"><View style={styles.content}>
    <View style={styles.brandMark}><Text style={styles.brandInitial}>E</Text></View>
    <Text style={styles.brand}>EventHub</Text><Text style={styles.tagline}>Find something worth showing up for.</Text>
    <View style={styles.form}><Field label="Email address" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" placeholder="you@example.com" /><Field label="Password" value={password} onChangeText={setPassword} secureTextEntry placeholder="Your password" />{error ? <Text style={styles.error}>{error}</Text> : null}<PrimaryButton label={submitting ? 'Signing in...' : 'Login'} onPress={() => void submit()} disabled={submitting} /></View>
    <View style={styles.linkRow}><Text style={styles.muted}>New to EventHub?</Text><Link href="/register" asChild><Pressable><Text style={styles.link}>Create an account</Text></Pressable></Link></View>
    <Text style={styles.demo}>Demo: user@eventhub.com / User12345</Text>
  </View></ScrollView></KeyboardAvoidingView>;
}
const styles = StyleSheet.create({ screen: { flex: 1, backgroundColor: Palette.background }, scroll: { flexGrow: 1, justifyContent: 'center', padding: 24 }, content: { width: '100%', maxWidth: 460, alignSelf: 'center' }, brandMark: { width: 46, height: 46, borderRadius: 13, backgroundColor: Palette.green, alignItems: 'center', justifyContent: 'center', marginBottom: 18 }, brandInitial: { color: '#FFF', fontSize: 24, fontWeight: '700' }, brand: { color: Palette.text, fontSize: 30, fontWeight: '700' }, tagline: { color: Palette.textSecondary, fontSize: 16, marginTop: 7, marginBottom: 30 }, form: { borderWidth: 1, borderColor: Palette.border, borderRadius: 16, backgroundColor: Palette.card, padding: 20 }, error: { color: Palette.error, fontSize: 13, marginTop: -5, marginBottom: 14 }, linkRow: { flexDirection: 'row', justifyContent: 'center', gap: 6, marginTop: 22 }, muted: { color: Palette.textSecondary, fontSize: 14 }, link: { color: Palette.green, fontSize: 14, fontWeight: '700' }, demo: { color: Palette.textMuted, textAlign: 'center', fontSize: 12, marginTop: 18 } });
