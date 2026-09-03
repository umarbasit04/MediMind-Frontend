import { Ionicons } from '@expo/vector-icons';
import { NavigationContainer, useNavigation } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Linking,
  Platform,
  Pressable,
  SafeAreaView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { api, ApiError } from './src/api';
import { BrandMark, EmptyState, ErrorState, Field, IconButton, LoadingState, Page, PrimaryButton, SectionTitle, SecondaryButton, StatusPill } from './src/components';
import { enablePush, pushAlreadyEnabled, pushSupported } from './src/push';
import { useAuthStore } from './src/store';
import { colors, radii, shared } from './src/theme';
import { AdherenceStats, EmergencyContact, FamilyMember, Medicine, Reminder, TodayItem, User } from './src/types';

const AuthStack = createNativeStackNavigator();
const AppStack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function friendlyError(error: unknown) {
  return error instanceof ApiError ? error.message : 'Something unexpected happened. Please try again.';
}

function confirmDialog(message: string): Promise<boolean> {
  if (Platform.OS === 'web') return Promise.resolve(window.confirm(message));
  return new Promise((resolve) =>
    Alert.alert('Please confirm', message, [
      { text: 'Cancel', style: 'cancel', onPress: () => resolve(false) },
      { text: 'Yes', style: 'destructive', onPress: () => resolve(true) },
    ]),
  );
}

function Header({ title, onBack }: { title: string; onBack?: () => void }) {
  return <View style={{ alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', marginBottom: 22 }}><View style={{ alignItems: 'center', flexDirection: 'row' }}>{onBack ? <IconButton icon="arrow-back" label="Go back" onPress={onBack} /> : null}<Text style={[shared.h2, onBack && { marginLeft: 12 }]}>{title}</Text></View><BrandMark small /></View>;
}

function Splash({ error, onRetry }: { error?: string; onRetry: () => void }) {
  return <SafeAreaView style={[shared.screen, { alignItems: 'center', justifyContent: 'center', padding: 24 }]}><BrandMark /><View style={{ alignItems: 'center', marginTop: 44, maxWidth: 390 }}><View style={{ alignItems: 'center', backgroundColor: colors.tealSoft, borderRadius: 52, height: 104, justifyContent: 'center', width: 104 }}><Ionicons color={colors.teal} name="heart-outline" size={55} /></View><Text style={[shared.title, { marginTop: 24, textAlign: 'center' }]}>Your health, gently organized.</Text>{error ? <View style={{ marginTop: 22, width: '100%' }}><ErrorState message={error} onRetry={onRetry} /></View> : <><Text style={[shared.body, { marginTop: 10, textAlign: 'center' }]}>Getting your care plan ready…</Text><LoadingState label="" /></>}</View><Text style={[shared.caption, { bottom: 28, position: 'absolute' }]}>MediMind • Medication made simpler</Text></SafeAreaView>;
}

function LoginScreen() {
  const navigation = useNavigation<any>();
  const signIn = useAuthStore((s) => s.signIn);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const submit = async () => {
    setError('');
    if (!/^\S+@\S+\.\S+$/.test(email)) return setError('Please enter a valid email address.');
    if (password.length < 8) return setError('Your password needs at least 8 characters.');
    setBusy(true);
    try { await signIn(await api.login({ email: email.trim(), password })); } catch (e) { setError(friendlyError(e)); } finally { setBusy(false); }
  };
  return <SafeAreaView style={shared.screen}><Page><View style={{ alignItems: 'center', marginBottom: 36 }}><BrandMark /><Text style={[shared.title, { fontSize: 27, marginTop: 34, textAlign: 'center' }]}>Welcome back</Text><Text style={[shared.body, { marginTop: 8, textAlign: 'center' }]}>Let’s keep your medicines on track.</Text></View><View style={shared.card}><Field autoCapitalize="none" autoComplete="email" keyboardType="email-address" label="Email address" onChangeText={setEmail} placeholder="you@example.com" value={email} /><Field autoCapitalize="none" label="Password" onChangeText={setPassword} placeholder="At least 8 characters" secureTextEntry value={password} />{error ? <Text style={[shared.errorText, { marginBottom: 15 }]}>{error}</Text> : null}<PrimaryButton loading={busy} onPress={submit} title="Sign in" /></View><View style={{ alignItems: 'center', flexDirection: 'row', justifyContent: 'center', marginTop: 24 }}><Text style={shared.body}>New to MediMind? </Text><Pressable onPress={() => navigation.navigate('Register')}><Text style={{ color: colors.teal, fontSize: 16, fontWeight: '800' }}>Create account</Text></Pressable></View></Page></SafeAreaView>;
}

function RegisterScreen() {
  const navigation = useNavigation<any>();
  const signIn = useAuthStore((s) => s.signIn);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const submit = async () => {
    setError('');
    if (name.trim().length < 2) return setError('Please tell us your full name.');
    if (!/^\S+@\S+\.\S+$/.test(email)) return setError('Please enter a valid email address.');
    if (password.length < 8) return setError('Your password needs at least 8 characters.');
    setBusy(true);
    try { await signIn(await api.register({ full_name: name.trim(), email: email.trim(), password })); } catch (e) { setError(friendlyError(e)); } finally { setBusy(false); }
  };
  return <SafeAreaView style={shared.screen}><Page><Header title="Create account" onBack={() => navigation.goBack()} /><Text style={[shared.body, { marginBottom: 24 }]}>A few details and we’ll help make every dose easier to remember.</Text><View style={shared.card}><Field label="Full name" onChangeText={setName} placeholder="Your name" value={name} /><Field autoCapitalize="none" autoComplete="email" keyboardType="email-address" label="Email address" onChangeText={setEmail} placeholder="you@example.com" value={email} /><Field autoCapitalize="none" label="Password" onChangeText={setPassword} placeholder="At least 8 characters" secureTextEntry value={password} />{error ? <Text style={[shared.errorText, { marginBottom: 15 }]}>{error}</Text> : null}<PrimaryButton loading={busy} onPress={submit} title="Create my account" /></View></Page></SafeAreaView>;
}

function DashboardScreen() {
  const navigation = useNavigation<any>();
  const token = useAuthStore((s) => s.token)!;
  const user = useAuthStore((s) => s.user);
  const [items, setItems] = useState<TodayItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [workingId, setWorkingId] = useState('');
  const [pushState, setPushState] = useState<'hidden' | 'off' | 'busy' | 'on'>('hidden');
  const [pushError, setPushError] = useState('');
  const todayLabel = useMemo(
    () => new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: '2-digit' }).toUpperCase(),
    [],
  );
  const load = async (pull = false) => {
    pull ? setRefreshing(true) : setLoading(true); setError('');
    try { setItems(await api.today(token)); } catch (e) { setError(friendlyError(e)); } finally { setLoading(false); setRefreshing(false); }
  };
  useEffect(() => { load(); }, []);
  useEffect(() => {
    if (Platform.OS === 'web' && pushSupported()) {
      pushAlreadyEnabled().then((on) => setPushState(on ? 'on' : 'off')).catch(() => setPushState('off'));
    }
  }, []);
  const turnOnPush = async () => {
    setPushState('busy'); setPushError('');
    try { await enablePush(token); setPushState('on'); } catch (e) { setPushError(e instanceof Error ? e.message : friendlyError(e)); setPushState('off'); }
  };
  const mark = async (item: TodayItem, status: 'taken' | 'skipped') => {
    setWorkingId(item.reminder_id);
    try { await api.mark(token, item.reminder_id, status); await load(); } catch (e) { Alert.alert('Could not update dose', friendlyError(e)); } finally { setWorkingId(''); }
  };
  const greeting = user?.full_name ? `Good morning, ${user.full_name.split(' ')[0]}` : 'Good morning';
  return <Page refreshing={refreshing} onRefresh={() => load(true)}><View style={{ alignItems: 'flex-start', flexDirection: 'row', justifyContent: 'space-between', marginBottom: 26 }}><View style={{ flex: 1 }}><Text style={{ color: colors.teal, fontSize: 14, fontWeight: '800', marginBottom: 6 }}>{todayLabel}</Text><Text style={shared.title}>{greeting}</Text><Text style={[shared.body, { marginTop: 6 }]}>Here’s your medication plan for today.</Text></View><View style={{ backgroundColor: colors.amberSoft, borderRadius: 28, padding: 12 }}><Ionicons color="#9B681D" name="sunny-outline" size={25} /></View></View><View style={[shared.card, { backgroundColor: colors.teal, borderColor: colors.teal, marginBottom: 24 }]}><View style={{ alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' }}><View><Text style={{ color: '#BEEBE7', fontSize: 14, fontWeight: '800' }}>TODAY’S CARE PLAN</Text><Text style={{ color: colors.white, fontSize: 25, fontWeight: '900', marginTop: 6 }}>{items.filter((item) => item.status === 'taken').length} of {items.length} doses taken</Text></View><View style={{ alignItems: 'center', borderColor: '#92D8D3', borderRadius: 35, borderWidth: 5, height: 70, justifyContent: 'center', width: 70 }}><Ionicons color={colors.white} name="checkmark" size={32} /></View></View><Pressable onPress={() => navigation.navigate('ReminderSettings')} style={{ alignItems: 'center', flexDirection: 'row', marginTop: 18 }}><Text style={{ color: colors.white, fontSize: 15, fontWeight: '800' }}>Manage reminders</Text><Ionicons color={colors.white} name="arrow-forward" size={18} style={{ marginLeft: 6 }} /></Pressable></View>{pushState !== 'hidden' ? <View style={[shared.card, { marginBottom: 22 }]}>{pushState === 'on' ? <View style={{ alignItems: 'center', flexDirection: 'row' }}><Ionicons color={colors.teal} name="notifications" size={22} /><Text style={{ color: colors.tealDark, flex: 1, fontSize: 15, fontWeight: '800', marginLeft: 10 }}>Reminders are on for this device</Text></View> : <><View style={{ alignItems: 'center', flexDirection: 'row' }}><Ionicons color={colors.teal} name="notifications-outline" size={22} /><Text style={{ flex: 1, fontSize: 15, fontWeight: '800', marginLeft: 10 }}>Get a reminder when it’s time for a dose</Text></View>{pushError ? <Text style={[shared.errorText, { marginTop: 10 }]}>{pushError}</Text> : null}<PrimaryButton loading={pushState === 'busy'} onPress={turnOnPush} style={{ marginTop: 12 }} title="Enable reminders" /></>}</View> : null}<SectionTitle eyebrow="Dose schedule" title="Today’s medicines" subtitle="Take a dose when it’s due, or skip it if needed." />{loading ? <LoadingState label="Loading today’s doses…" /> : error ? <ErrorState message={error} onRetry={() => load()} /> : items.length === 0 ? <EmptyState icon="calendar-outline" title="No doses scheduled today" body="Your day is clear. Add a medicine to start a reminder plan." /> : items.map((item) => <View key={item.reminder_id} style={[shared.card, { marginBottom: 12, opacity: item.status === 'taken' || item.status === 'skipped' ? 0.78 : 1 }]}><View style={{ alignItems: 'flex-start', flexDirection: 'row', justifyContent: 'space-between' }}><View style={{ flex: 1 }}><Text style={{ color: colors.teal, fontSize: 15, fontWeight: '900' }}>{item.time_of_day}</Text><Text style={[shared.h2, { marginTop: 4 }]}>{item.medicine_name}</Text><Text style={[shared.body, { marginTop: 2 }]}>{item.dosage}</Text></View><StatusPill status={item.status} /></View>{item.status === 'pending' ? <View style={{ flexDirection: 'row', marginTop: 18 }}><PrimaryButton style={{ flex: 1, marginRight: 8 }} title="Taken" onPress={() => mark(item, 'taken')} loading={workingId === item.reminder_id} /><SecondaryButton style={{ flex: 1 }} title="Skip" onPress={() => mark(item, 'skipped')} /></View> : null}</View>)}</Page>;
}

function MedicineListScreen() {
  const navigation = useNavigation<any>();
  const token = useAuthStore((s) => s.token)!;
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const load = async (pull = false, query = search) => {
    pull ? setRefreshing(true) : setLoading(true); setError('');
    try { setMedicines(await api.medicines(token, query)); } catch (e) { setError(friendlyError(e)); } finally { setLoading(false); setRefreshing(false); }
  };
  useEffect(() => { load(); }, []);
  return <Page refreshing={refreshing} onRefresh={() => load(true)}><View style={{ alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', marginBottom: 22 }}><Text style={shared.title}>My medicines</Text><IconButton icon="add" label="Add medicine" onPress={() => navigation.navigate('AddMedicine')} /></View><View style={{ flexDirection: 'row', marginBottom: 22 }}><Field autoCapitalize="none" containerStyle={{ flex: 1, marginBottom: 0 }} label="" onChangeText={setSearch} onSubmitEditing={() => load(false, search)} placeholder="Search medicines" returnKeyType="search" value={search} /><Pressable onPress={() => load(false, search)} style={{ alignItems: 'center', backgroundColor: colors.teal, borderRadius: radii.sm, height: 54, justifyContent: 'center', marginLeft: 8, width: 54 }}><Ionicons color={colors.white} name="search" size={23} /></Pressable></View>{loading ? <LoadingState label="Loading your medicines…" /> : error ? <ErrorState message={error} onRetry={() => load()} /> : medicines.length === 0 ? <EmptyState icon="medkit-outline" title={search ? 'No matches found' : 'No medicines yet'} body={search ? 'Try a different medicine name.' : 'Add your first medicine and we’ll keep its schedule close at hand.'} /> : medicines.map((medicine) => <Pressable key={medicine.id} onPress={() => navigation.navigate('ReminderSettings', { medicineId: medicine.id })} style={({ pressed }) => [shared.card, { marginBottom: 12 }, pressed && { borderColor: colors.teal, opacity: 0.85 }]}><View style={{ alignItems: 'center', flexDirection: 'row' }}><View style={{ alignItems: 'center', backgroundColor: colors.tealSoft, borderRadius: 24, height: 48, justifyContent: 'center', width: 48 }}><Ionicons color={colors.teal} name="medical-outline" size={24} /></View><View style={{ flex: 1, marginLeft: 14 }}><Text style={shared.h2}>{medicine.name}</Text><Text style={[shared.body, { marginTop: 2 }]}>{medicine.dosage} • {medicine.frequency_per_day} {medicine.frequency_per_day === 1 ? 'time' : 'times'} daily</Text></View><Ionicons color={colors.inkMuted} name="chevron-forward" size={21} /></View>{medicine.instructions ? <Text style={[shared.caption, { marginLeft: 62, marginTop: 9 }]}>{medicine.instructions}</Text> : null}</Pressable>)}</Page>;
}

function AddMedicineScreen() {
  const navigation = useNavigation<any>();
  const token = useAuthStore((s) => s.token)!;
  const [name, setName] = useState('');
  const [dosage, setDosage] = useState('');
  const [form, setForm] = useState('tablet');
  const [times, setTimes] = useState(['08:00']);
  const [instructions, setInstructions] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const validTime = (time: string) => /^([01]\d|2[0-3]):[0-5]\d$/.test(time);
  const submit = async () => {
    setError('');
    if (!name.trim()) return setError('Please enter the medicine name.');
    if (!dosage.trim()) return setError('Please enter the dosage, for example 500 mg.');
    if (times.some((time) => !validTime(time))) return setError('Times must use 24-hour format, like 08:00 or 20:30.');
    setBusy(true);
    try { await api.addMedicine(token, { name: name.trim(), dosage: dosage.trim(), form: form.trim() || 'tablet', frequency_per_day: times.length, start_date: new Date().toISOString().slice(0, 10), instructions: instructions.trim(), reminder_times: times, days_of_week: [1, 2, 3, 4, 5, 6, 7] }); navigation.goBack(); } catch (e) { setError(friendlyError(e)); } finally { setBusy(false); }
  };
  return <Page><Header title="Add medicine" onBack={() => navigation.goBack()} /><Text style={[shared.body, { marginBottom: 22 }]}>We’ll create a reminder for each time you add.</Text><View style={shared.card}><Field label="Medicine name" onChangeText={setName} placeholder="e.g. Metformin" value={name} /><Field label="Dosage" onChangeText={setDosage} placeholder="e.g. 500 mg" value={dosage} /><Field label="Form" onChangeText={setForm} placeholder="e.g. tablet, capsule" value={form} /><Text style={shared.label}>Reminder times</Text>{times.map((time, index) => <View key={index} style={{ alignItems: 'center', flexDirection: 'row', marginBottom: 10 }}><TextInputTime value={time} onChange={(value) => setTimes(times.map((current, i) => i === index ? value : current))} /><Pressable accessibilityLabel={`Remove time ${index + 1}`} disabled={times.length === 1} onPress={() => setTimes(times.filter((_, i) => i !== index))} style={{ marginLeft: 10, opacity: times.length === 1 ? 0.3 : 1 }}><Ionicons color={colors.red} name="trash-outline" size={23} /></Pressable></View>)}<SecondaryButton title="Add another time" onPress={() => setTimes([...times, '20:00'])} style={{ marginBottom: 18 }} /><Field label="Instructions (optional)" multiline onChangeText={setInstructions} placeholder="e.g. Take after food" value={instructions} />{error ? <Text style={[shared.errorText, { marginBottom: 15 }]}>{error}</Text> : null}<PrimaryButton loading={busy} onPress={submit} title="Save medicine" /></View></Page>;
}

function TextInputTime({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return <View style={{ alignItems: 'center', backgroundColor: colors.mint, borderColor: colors.line, borderRadius: radii.sm, borderWidth: 1, flex: 1, flexDirection: 'row', height: 54, paddingHorizontal: 16 }}><Ionicons color={colors.teal} name="time-outline" size={22} /><TextInput accessibilityLabel="Reminder time" keyboardType="numbers-and-punctuation" maxLength={5} onChangeText={onChange} placeholder="08:00" placeholderTextColor="#89A0A7" style={{ color: colors.ink, flex: 1, fontSize: 18, fontWeight: '800', marginLeft: 11 }} value={value} /></View>;
}

function ReminderSettingsScreen() {
  const navigation = useNavigation<any>();
  const token = useAuthStore((s) => s.token)!;
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState('');
  const load = async (pull = false) => {
    pull ? setRefreshing(true) : setLoading(true); setError('');
    try { setReminders(await api.reminders(token)); } catch (e) { setError(friendlyError(e)); } finally { setLoading(false); setRefreshing(false); }
  };
  useEffect(() => { load(); }, []);
  const update = async (reminder: Reminder, body: { time_of_day?: string; is_enabled?: boolean }) => {
    setBusyId(reminder.id);
    try { const updated = await api.updateReminder(token, reminder.id, body); setReminders((all) => all.map((item) => item.id === reminder.id ? { ...item, ...updated } : item)); } catch (e) { Alert.alert('Could not update reminder', friendlyError(e)); } finally { setBusyId(''); }
  };
  return <Page refreshing={refreshing} onRefresh={() => load(true)}><Header title="Reminder settings" onBack={() => navigation.goBack()} /><Text style={[shared.body, { marginBottom: 22 }]}>Choose when your reminders should reach you.</Text>{loading ? <LoadingState label="Loading reminder settings…" /> : error ? <ErrorState message={error} onRetry={() => load()} /> : reminders.length === 0 ? <EmptyState icon="notifications-outline" title="No reminders to manage" body="Add a medicine first and its reminder times will appear here." /> : reminders.map((reminder) => <View key={reminder.id} style={[shared.card, { marginBottom: 12 }]}><View style={{ alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' }}><View style={{ flex: 1 }}><Text style={shared.h2}>{reminder.medicine_name || 'Medicine reminder'}</Text><Text style={[shared.body, { marginTop: 3 }]}>{reminder.time_of_day}</Text></View><Pressable accessibilityRole="switch" accessibilityState={{ checked: reminder.is_enabled }} disabled={busyId === reminder.id} onPress={() => update(reminder, { is_enabled: !reminder.is_enabled })} style={{ backgroundColor: reminder.is_enabled ? colors.teal : '#B9C7CA', borderRadius: 16, height: 32, justifyContent: 'center', padding: 3, width: 52 }}><View style={{ alignSelf: reminder.is_enabled ? 'flex-end' : 'flex-start', backgroundColor: colors.white, borderRadius: 13, height: 26, width: 26 }} /></Pressable></View><View style={{ alignItems: 'center', flexDirection: 'row', marginTop: 16 }}><TextInputTime value={reminder.time_of_day} onChange={(value) => setReminders((all) => all.map((item) => item.id === reminder.id ? { ...item, time_of_day: value } : item))} /><SecondaryButton title="Save time" onPress={() => /^([01]\d|2[0-3]):[0-5]\d$/.test(reminder.time_of_day) ? update(reminder, { time_of_day: reminder.time_of_day }) : Alert.alert('Check the time', 'Use 24-hour format, like 08:00.')} style={{ marginLeft: 10 }} /></View></View>)}</Page>;
}

function ProfileScreen() {
  const navigation = useNavigation<any>();
  const token = useAuthStore((s) => s.token)!;
  const storedUser = useAuthStore((s) => s.user);
  const signOut = useAuthStore((s) => s.signOut);
  const [user, setUser] = useState<User | null>(storedUser);
  const [stats, setStats] = useState<AdherenceStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [name, setName] = useState(storedUser?.full_name || '');
  const [phone, setPhone] = useState(storedUser?.phone || '');
  const [dob, setDob] = useState(storedUser?.date_of_birth || '');
  const [caretaker, setCaretaker] = useState<FamilyMember | null>(null);
  const [showCaretakerForm, setShowCaretakerForm] = useState(false);
  const [ckName, setCkName] = useState('');
  const [ckRelation, setCkRelation] = useState('');
  const [ckPhone, setCkPhone] = useState('');
  const [ckEmail, setCkEmail] = useState('');
  const [ckBusy, setCkBusy] = useState(false);
  const [ckError, setCkError] = useState('');
  const load = async (pull = false) => {
    pull ? setRefreshing(true) : setLoading(true); setError('');
    try { const [profile, adherence] = await Promise.all([api.profile(token), api.stats(token)]); setUser(profile.user); setName(profile.user.full_name); setPhone(profile.user.phone || ''); setDob(profile.user.date_of_birth || ''); setStats(adherence); const caretakerResult = await api.caretaker(token).catch(() => null); setCaretaker(caretakerResult); } catch (e) { setError(friendlyError(e)); } finally { setLoading(false); setRefreshing(false); }
  };
  useEffect(() => { load(); }, []);
  const save = async () => { if (!name.trim()) return setError('Please enter your full name.'); setSaving(true); setError(''); try { const result = await api.updateProfile(token, { full_name: name.trim(), phone: phone.trim() || null, date_of_birth: dob.trim() || null }); setUser(result.user); Alert.alert('Profile saved', 'Your details are up to date.'); } catch (e) { setError(friendlyError(e)); } finally { setSaving(false); } };
  const saveCaretaker = async () => {
    setCkError('');
    if (!ckName.trim()) return setCkError('Please enter the caretaker name.');
    if (ckEmail.trim() && !/^\S+@\S+\.\S+$/.test(ckEmail.trim())) return setCkError('Please enter a valid email, or leave it empty.');
    setCkBusy(true);
    try {
      const member = await api.addFamilyMember(token, { name: ckName.trim(), relation: ckRelation.trim() || null, phone: ckPhone.trim() || null, email: ckEmail.trim() || null, can_view_adherence: true });
      setCaretaker(member); setShowCaretakerForm(false); setCkName(''); setCkRelation(''); setCkPhone(''); setCkEmail('');
    } catch (e) { setCkError(friendlyError(e)); } finally { setCkBusy(false); }
  };
  if (loading) return <Page><Header title="My profile" /><LoadingState label="Loading your profile…" /></Page>;
  if (error && !user) return <Page><Header title="My profile" /><ErrorState message={error} onRetry={() => load()} /></Page>;
  return <Page refreshing={refreshing} onRefresh={() => load(true)}><Header title="My profile" /><View style={{ alignItems: 'center', marginBottom: 24 }}><View style={{ alignItems: 'center', backgroundColor: colors.tealSoft, borderRadius: 44, height: 88, justifyContent: 'center', width: 88 }}><Text style={{ color: colors.tealDark, fontSize: 32, fontWeight: '900' }}>{(user?.full_name || 'M').charAt(0).toUpperCase()}</Text></View><Text style={[shared.h2, { marginTop: 12 }]}>{user?.full_name}</Text><Text style={shared.body}>{user?.email}</Text></View>{stats ? <View style={[shared.card, { marginBottom: 20 }]}><Text style={[shared.h2, { marginBottom: 16 }]}>Your adherence</Text><View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>{[['rate_percent', `${stats.rate_percent}%`, 'on track'], ['streak_days', `${stats.streak_days}`, 'day streak'], ['taken', `${stats.taken}`, 'taken']].map(([key, value, label]) => <View key={key} style={{ alignItems: 'center', flex: 1 }}><Text style={{ color: colors.teal, fontSize: 27, fontWeight: '900' }}>{value}</Text><Text style={[shared.caption, { marginTop: 3 }]}>{label}</Text></View>)}</View></View> : <EmptyState icon="stats-chart-outline" title="No adherence stats yet" body="Your progress will appear after you log a dose." />}{error ? <Text style={[shared.errorText, { marginBottom: 15 }]}>{error}</Text> : null}<View style={shared.card}><Text style={[shared.h2, { marginBottom: 18 }]}>Personal details</Text><Field label="Full name" onChangeText={setName} value={name} /><Field keyboardType="phone-pad" label="Phone (optional)" onChangeText={setPhone} value={phone} /><Field label="Date of birth (optional)" onChangeText={setDob} placeholder="YYYY-MM-DD" value={dob} /><PrimaryButton loading={saving} onPress={save} title="Save changes" /></View><View style={[shared.card, { marginTop: 18 }]}><Text style={[shared.h2, { marginBottom: 6 }]}>Your caretaker</Text><Text style={[shared.body, { marginBottom: 14 }]}>Receives an email alert when you press SOS.</Text>{caretaker ? <View style={{ alignItems: 'center', flexDirection: 'row' }}><View style={{ alignItems: 'center', backgroundColor: colors.tealSoft, borderRadius: 23, height: 46, justifyContent: 'center', width: 46 }}><Ionicons color={colors.teal} name="heart-outline" size={23} /></View><View style={{ flex: 1, marginLeft: 13 }}><Text style={shared.h2}>{caretaker.name}</Text><Text style={[shared.body, { marginTop: 2 }]}>{[caretaker.relation, caretaker.phone, caretaker.email].filter(Boolean).join(' • ')}</Text></View></View> : showCaretakerForm ? <View><Field label="Caretaker name" onChangeText={setCkName} value={ckName} /><Field label="Relation (optional)" onChangeText={setCkRelation} placeholder="e.g. Daughter" value={ckRelation} /><Field keyboardType="phone-pad" label="Phone (optional)" onChangeText={setCkPhone} value={ckPhone} /><Field autoCapitalize="none" keyboardType="email-address" label="Email (for SOS alerts)" onChangeText={setCkEmail} placeholder="caretaker@example.com" value={ckEmail} />{ckError ? <Text style={[shared.errorText, { marginBottom: 12 }]}>{ckError}</Text> : null}<PrimaryButton loading={ckBusy} onPress={saveCaretaker} title="Save caretaker" /><SecondaryButton onPress={() => setShowCaretakerForm(false)} style={{ marginTop: 10 }} title="Cancel" /></View> : <><Text style={[shared.body, { marginBottom: 12 }]}>No caretaker added yet.</Text><SecondaryButton onPress={() => setShowCaretakerForm(true)} title="Add caretaker" /></>}</View><SecondaryButton onPress={() => navigation.navigate('Family')} style={{ marginTop: 12 }} title="Manage family & caretaker" /><SecondaryButton onPress={signOut} title="Sign out" style={{ marginTop: 18 }} /></Page>;
}

function SosScreen() {
  const navigation = useNavigation<any>();
  const token = useAuthStore((s) => s.token)!;
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState('');
  const [caretaker, setCaretaker] = useState<FamilyMember | null>(null);
  const load = async (pull = false) => { pull ? setRefreshing(true) : setLoading(true); setError(''); try { setContacts(await api.contacts(token)); } catch (e) { setError(friendlyError(e)); } finally { setLoading(false); setRefreshing(false); } };
  useEffect(() => { load(); api.caretaker(token).then(setCaretaker).catch(() => setCaretaker(null)); }, []);
  const sendSos = async () => { const ok = await confirmDialog('Send an emergency alert to your caretaker and trusted contacts?'); if (!ok) return; setSent(false); setMessage(''); setSending(true); try { const result = await api.sos(token); setMessage(`Alert sent to ${caretaker?.name || 'your care team'}`); setContacts(result.contacts); setSent(true); } catch (e) { setError(friendlyError(e)); } finally { setSending(false); } };
  const call = (phone: string) => { if (Platform.OS === 'web') window.open(`tel:${phone}`, '_self'); else Linking.openURL(`tel:${phone}`); };
  return <Page refreshing={refreshing} onRefresh={() => load(true)}><View style={{ alignItems: 'center', marginBottom: 24 }}><View style={{ alignItems: 'center', flexDirection: 'row', marginBottom: 19, width: '100%' }}><View style={{ flex: 1 }}><Text style={shared.title}>Emergency SOS</Text><Text style={[shared.body, { marginTop: 6 }]}>One tap to bring your trusted contacts close.</Text></View><View style={{ backgroundColor: colors.redSoft, borderRadius: 24, padding: 12 }}><Ionicons color={colors.red} name="shield-checkmark-outline" size={25} /></View></View><Pressable accessibilityRole="button" disabled={sending} onPress={sendSos} style={({ pressed }) => [{ alignItems: 'center', backgroundColor: colors.coral, borderColor: '#F7B2A1', borderRadius: 120, borderWidth: 8, height: 210, justifyContent: 'center', shadowColor: colors.coralDark, shadowOffset: { height: 8, width: 0 }, shadowOpacity: 0.25, shadowRadius: 14, width: 210 }, pressed && { opacity: 0.84, transform: [{ scale: 0.98 }] }]}><Ionicons color={colors.white} name="alert" size={42} /><Text style={{ color: colors.white, fontSize: 31, fontWeight: '900', marginTop: 5 }}>SOS</Text><Text style={{ color: '#FFE7E1', fontSize: 13, fontWeight: '800', marginTop: 2 }}>TAP FOR HELP</Text></Pressable></View>{sent ? <View style={[shared.card, { backgroundColor: colors.tealSoft, borderColor: '#A8DEDA', marginBottom: 20 }]}><View style={{ alignItems: 'center', flexDirection: 'row' }}><Ionicons color={colors.tealDark} name="checkmark-circle" size={24} /><Text style={{ color: colors.tealDark, flex: 1, fontSize: 16, fontWeight: '800', marginLeft: 10 }}>{message}</Text></View></View> : null}<SectionTitle eyebrow="Trusted contacts" title="Call someone now" subtitle="These are the people your care team can reach in an emergency." /><SecondaryButton onPress={() => navigation.navigate('Contacts')} style={{ marginBottom: 16 }} title="Add / manage contacts" />{loading ? <LoadingState label="Loading emergency contacts…" /> : error ? <ErrorState message={error} onRetry={() => load()} /> : contacts.length === 0 ? <EmptyState icon="people-outline" title="No emergency contacts yet" body="Ask a family member or care partner to be added as a contact." /> : contacts.map((contact, index) => <View key={`${contact.phone}-${index}`} style={[shared.card, { marginBottom: 12 }]}><View style={{ alignItems: 'center', flexDirection: 'row' }}><View style={{ alignItems: 'center', backgroundColor: colors.amberSoft, borderRadius: 23, height: 46, justifyContent: 'center', width: 46 }}><Ionicons color="#9B681D" name="person-outline" size={23} /></View><View style={{ flex: 1, marginLeft: 13 }}><Text style={shared.h2}>{contact.name}</Text><Text style={shared.body}>{contact.relation} • {contact.phone}</Text></View><Pressable accessibilityRole="button" onPress={() => call(contact.phone)} style={{ alignItems: 'center', backgroundColor: colors.teal, borderRadius: radii.sm, flexDirection: 'row', minHeight: 46, paddingHorizontal: 13 }}><Ionicons color={colors.white} name="call" size={18} /><Text style={{ color: colors.white, fontSize: 15, fontWeight: '800', marginLeft: 6 }}>Call now</Text></Pressable></View></View>)}</Page>;
}

function ContactsScreen() {
  const navigation = useNavigation<any>();
  const token = useAuthStore((s) => s.token)!;
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<EmergencyContact | null>(null);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [relation, setRelation] = useState('');
  const [isPrimary, setIsPrimary] = useState(false);
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState('');
  const load = async () => { setLoading(true); setError(''); try { setContacts(await api.contacts(token)); } catch (e) { setError(friendlyError(e)); } finally { setLoading(false); } };
  useEffect(() => { load(); }, []);
  const openNew = () => { setEditing(null); setName(''); setPhone(''); setRelation(''); setIsPrimary(false); setFormError(''); setFormOpen(true); };
  const openEdit = (contact: EmergencyContact) => { setEditing(contact); setName(contact.name); setPhone(contact.phone); setRelation(contact.relation || ''); setIsPrimary(Boolean(contact.is_primary)); setFormError(''); setFormOpen(true); };
  const save = async () => {
    setFormError('');
    if (!name.trim()) return setFormError('Please enter a name.');
    if (!phone.trim()) return setFormError('Please enter a phone number.');
    setBusy(true);
    const body = { name: name.trim(), phone: phone.trim(), relation: relation.trim() || null, is_primary: isPrimary };
    try {
      if (editing?.id) await api.updateContact(token, editing.id, body);
      else await api.addContact(token, body);
      setFormOpen(false);
      await load();
    } catch (e) { setFormError(friendlyError(e)); } finally { setBusy(false); }
  };
  const remove = async (contact: EmergencyContact) => {
    if (!contact.id) return;
    const ok = await confirmDialog(`Remove ${contact.name} from your emergency contacts?`);
    if (!ok) return;
    try { await api.deleteContact(token, contact.id); await load(); } catch (e) { setError(friendlyError(e)); }
  };
  return <Page><Header title="Emergency contacts" onBack={() => navigation.goBack()} /><Text style={[shared.body, { marginBottom: 20 }]}>These people are one tap away when you press SOS. Keep at least one.</Text>{loading ? <LoadingState label="Loading contacts…" /> : error ? <ErrorState message={error} onRetry={load} /> : contacts.length === 0 ? <EmptyState icon="people-outline" title="No emergency contacts yet" body="Add a family member, friend, or doctor so SOS can reach someone." /> : contacts.map((contact) => <View key={contact.id || contact.phone} style={[shared.card, { marginBottom: 12 }]}><View style={{ alignItems: 'center', flexDirection: 'row' }}><View style={{ flex: 1 }}><Text style={shared.h2}>{contact.name}{contact.is_primary ? ' • Primary' : ''}</Text><Text style={[shared.body, { marginTop: 2 }]}>{contact.relation ? `${contact.relation} • ` : ''}{contact.phone}</Text></View><IconButton icon="create-outline" label={`Edit ${contact.name}`} onPress={() => openEdit(contact)} /><IconButton icon="trash-outline" label={`Remove ${contact.name}`} onPress={() => remove(contact)} /></View></View>)}{formOpen ? <View style={[shared.card, { marginBottom: 14 }]}><Text style={[shared.h2, { marginBottom: 14 }]}>{editing?.id ? 'Edit contact' : 'Add contact'}</Text><Field label="Full name" onChangeText={setName} value={name} /><Field keyboardType="phone-pad" label="Phone number" onChangeText={setPhone} value={phone} /><Field label="Relation (optional)" onChangeText={setRelation} placeholder="e.g. Daughter, Doctor" value={relation} /><Pressable accessibilityRole="switch" accessibilityState={{ checked: isPrimary }} onPress={() => setIsPrimary(!isPrimary)} style={{ alignItems: 'center', flexDirection: 'row', marginBottom: 16 }}><View style={{ backgroundColor: isPrimary ? colors.teal : '#B9C7CA', borderRadius: 16, height: 32, justifyContent: 'center', padding: 3, width: 52 }}><View style={{ alignSelf: isPrimary ? 'flex-end' : 'flex-start', backgroundColor: colors.white, borderRadius: 13, height: 26, width: 26 }} /></View><Text style={[shared.body, { marginLeft: 12 }]}>Primary contact</Text></Pressable>{formError ? <Text style={[shared.errorText, { marginBottom: 12 }]}>{formError}</Text> : null}<PrimaryButton loading={busy} onPress={save} title={editing?.id ? 'Save changes' : 'Add contact'} /><SecondaryButton onPress={() => setFormOpen(false)} style={{ marginTop: 10 }} title="Cancel" /></View> : <PrimaryButton onPress={openNew} title="Add emergency contact" /></Page>;
}

function FamilyScreen() {
  const navigation = useNavigation<any>();
  const token = useAuthStore((s) => s.token)!;
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<FamilyMember | null>(null);
  const [name, setName] = useState('');
  const [relation, setRelation] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [canView, setCanView] = useState(false);
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState('');
  const load = async () => { setLoading(true); setError(''); try { setMembers(await api.familyMembers(token)); } catch (e) { setError(friendlyError(e)); } finally { setLoading(false); } };
  useEffect(() => { load(); }, []);
  const openNew = () => { setEditing(null); setName(''); setRelation(''); setPhone(''); setEmail(''); setCanView(false); setFormError(''); setFormOpen(true); };
  const openEdit = (member: FamilyMember) => { setEditing(member); setName(member.name); setRelation(member.relation || ''); setPhone(member.phone || ''); setEmail(member.email || ''); setCanView(member.can_view_adherence); setFormError(''); setFormOpen(true); };
  const save = async () => {
    setFormError('');
    if (!name.trim()) return setFormError('Please enter a name.');
    if (email.trim() && !/^\S+@\S+\.\S+$/.test(email.trim())) return setFormError('Please enter a valid email, or leave it empty.');
    setBusy(true);
    const body = { name: name.trim(), relation: relation.trim() || null, phone: phone.trim() || null, email: email.trim() || null, can_view_adherence: canView };
    try {
      if (editing) await api.updateFamilyMember(token, editing.id, body);
      else await api.addFamilyMember(token, body);
      setFormOpen(false);
      await load();
    } catch (e) { setFormError(friendlyError(e)); } finally { setBusy(false); }
  };
  const remove = async (member: FamilyMember) => {
    const ok = await confirmDialog(`Remove ${member.name} from your family members?`);
    if (!ok) return;
    try { await api.deleteFamilyMember(token, member.id); await load(); } catch (e) { setError(friendlyError(e)); }
  };
  return <Page><Header title="Family & caretaker" onBack={() => navigation.goBack()} /><Text style={[shared.body, { marginBottom: 20 }]}>The caretaker is the family member who gets an email when you press SOS and can view your adherence.</Text>{loading ? <LoadingState label="Loading family members…" /> : error ? <ErrorState message={error} onRetry={load} /> : members.length === 0 ? <EmptyState icon="people-outline" title="No family members yet" body="Add a family member and mark them as your caretaker." /> : members.map((member) => <View key={member.id} style={[shared.card, { marginBottom: 12 }]}><View style={{ alignItems: 'center', flexDirection: 'row' }}><View style={{ alignItems: 'center', backgroundColor: member.can_view_adherence ? colors.tealSoft : colors.amberSoft, borderRadius: 23, height: 46, justifyContent: 'center', width: 46 }}><Ionicons color={member.can_view_adherence ? colors.teal : '#9B681D'} name="heart-outline" size={23} /></View><View style={{ flex: 1, marginLeft: 13 }}><Text style={shared.h2}>{member.name}{member.can_view_adherence ? ' • Caretaker' : ''}</Text><Text style={[shared.body, { marginTop: 2 }]}>{[member.relation, member.phone, member.email].filter(Boolean).join(' • ')}</Text></View><IconButton icon="create-outline" label={`Edit ${member.name}`} onPress={() => openEdit(member)} /><IconButton icon="trash-outline" label={`Remove ${member.name}`} onPress={() => remove(member)} /></View></View>)}{formOpen ? <View style={[shared.card, { marginBottom: 14 }]}><Text style={[shared.h2, { marginBottom: 14 }]}>{editing ? 'Edit family member' : 'Add family member'}</Text><Field label="Full name" onChangeText={setName} value={name} /><Field label="Relation (optional)" onChangeText={setRelation} placeholder="e.g. Daughter, Son" value={relation} /><Field keyboardType="phone-pad" label="Phone (optional)" onChangeText={setPhone} value={phone} /><Field autoCapitalize="none" keyboardType="email-address" label="Email (optional, for SOS alerts)" onChangeText={setEmail} value={email} /><Pressable accessibilityRole="switch" accessibilityState={{ checked: canView }} onPress={() => setCanView(!canView)} style={{ alignItems: 'center', flexDirection: 'row', marginBottom: 16 }}><View style={{ backgroundColor: canView ? colors.teal : '#B9C7CA', borderRadius: 16, height: 32, justifyContent: 'center', padding: 3, width: 52 }}><View style={{ alignSelf: canView ? 'flex-end' : 'flex-start', backgroundColor: colors.white, borderRadius: 13, height: 26, width: 26 }} /></View><Text style={[shared.body, { marginLeft: 12 }]}>Caretaker (SOS emails + view adherence)</Text></Pressable>{formError ? <Text style={[shared.errorText, { marginBottom: 12 }]}>{formError}</Text> : null}<PrimaryButton loading={busy} onPress={save} title={editing ? 'Save changes' : 'Add family member'} /><SecondaryButton onPress={() => setFormOpen(false)} style={{ marginTop: 10 }} title="Cancel" /></View> : <PrimaryButton onPress={openNew} title="Add family member" /></Page>;
}

function TabNavigator() {
  return <Tab.Navigator screenOptions={({ route }) => ({ headerShown: false, tabBarActiveTintColor: colors.teal, tabBarInactiveTintColor: colors.inkMuted, tabBarLabelStyle: { fontSize: 12, fontWeight: '700', paddingBottom: 3 }, tabBarStyle: { borderTopColor: colors.line, height: 68, paddingTop: 7 }, tabBarIcon: ({ color, size }) => { const icons: Record<string, keyof typeof Ionicons.glyphMap> = { Today: 'calendar-outline', Medicines: 'medkit-outline', SOS: 'alert-circle-outline', Profile: 'person-circle-outline' }; return <Ionicons color={color} name={icons[route.name]} size={size} />; } })}><Tab.Screen name="Today" component={DashboardScreen} /><Tab.Screen name="Medicines" component={MedicineListScreen} /><Tab.Screen name="SOS" component={SosScreen} /><Tab.Screen name="Profile" component={ProfileScreen} /></Tab.Navigator>;
}

function AuthenticatedStack() {
  return <AppStack.Navigator screenOptions={{ headerShown: false }}><AppStack.Screen name="MainTabs" component={TabNavigator} /><AppStack.Screen name="AddMedicine" component={AddMedicineScreen} /><AppStack.Screen name="ReminderSettings" component={ReminderSettingsScreen} /><AppStack.Screen name="Contacts" component={ContactsScreen} /><AppStack.Screen name="Family" component={FamilyScreen} /></AppStack.Navigator>;
}

export default function App() {
  const token = useAuthStore((s) => s.token);
  const hydrate = useAuthStore((s) => s.hydrate);
  const [booted, setBooted] = useState(false);
  const [bootError, setBootError] = useState('');
  const check = async () => { setBootError(''); setBooted(false); try { await hydrate(); } catch (e) { setBootError(friendlyError(e)); } finally { setBooted(true); } };
  useEffect(() => { check(); }, []);
  if (!booted) return <Splash error={bootError} onRetry={check} />;
  return <NavigationContainer>{token ? <AuthenticatedStack /> : <AuthStack.Navigator screenOptions={{ headerShown: false }}><AuthStack.Screen name="Login" component={LoginScreen} /><AuthStack.Screen name="Register" component={RegisterScreen} /></AuthStack.Navigator>}</NavigationContainer>;
}import { Ionicons } from '@expo/vector-icons';
import { NavigationContainer, useNavigation } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Linking,
  Platform,
  Pressable,
  SafeAreaView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { api, ApiError } from './src/api';
import { BrandMark, EmptyState, ErrorState, Field, IconButton, LoadingState, Page, PrimaryButton, SectionTitle, SecondaryButton, StatusPill } from './src/components';
import { enablePush, pushAlreadyEnabled, pushSupported } from './src/push';
import { useAuthStore } from './src/store';
import { colors, radii, shared } from './src/theme';
import { AdherenceStats, EmergencyContact, FamilyMember, Medicine, Reminder, TodayItem, User } from './src/types';

const AuthStack = createNativeStackNavigator();
const AppStack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function friendlyError(error: unknown) {
  return error instanceof ApiError ? error.message : 'Something unexpected happened. Please try again.';
}

function confirmDialog(message: string): Promise<boolean> {
  if (Platform.OS === 'web') return Promise.resolve(window.confirm(message));
  return new Promise((resolve) =>
    Alert.alert('Please confirm', message, [
      { text: 'Cancel', style: 'cancel', onPress: () => resolve(false) },
      { text: 'Yes', style: 'destructive', onPress: () => resolve(true) },
    ]),
  );
}

function Header({ title, onBack }: { title: string; onBack?: () => void }) {
  return <View style={{ alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', marginBottom: 22 }}><View style={{ alignItems: 'center', flexDirection: 'row' }}>{onBack ? <IconButton icon="arrow-back" label="Go back" onPress={onBack} /> : null}<Text style={[shared.h2, onBack && { marginLeft: 12 }]}>{title}</Text></View><BrandMark small /></View>;
}

function Splash({ error, onRetry }: { error?: string; onRetry: () => void }) {
  return <SafeAreaView style={[shared.screen, { alignItems: 'center', justifyContent: 'center', padding: 24 }]}><BrandMark /><View style={{ alignItems: 'center', marginTop: 44, maxWidth: 390 }}><View style={{ alignItems: 'center', backgroundColor: colors.tealSoft, borderRadius: 52, height: 104, justifyContent: 'center', width: 104 }}><Ionicons color={colors.teal} name="heart-outline" size={55} /></View><Text style={[shared.title, { marginTop: 24, textAlign: 'center' }]}>Your health, gently organized.</Text>{error ? <View style={{ marginTop: 22, width: '100%' }}><ErrorState message={error} onRetry={onRetry} /></View> : <><Text style={[shared.body, { marginTop: 10, textAlign: 'center' }]}>Getting your care plan ready…</Text><LoadingState label="" /></>}</View><Text style={[shared.caption, { bottom: 28, position: 'absolute' }]}>MediMind • Medication made simpler</Text></SafeAreaView>;
}

function LoginScreen() {
  const navigation = useNavigation<any>();
  const signIn = useAuthStore((s) => s.signIn);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const submit = async () => {
    setError('');
    if (!/^\S+@\S+\.\S+$/.test(email)) return setError('Please enter a valid email address.');
    if (password.length < 8) return setError('Your password needs at least 8 characters.');
    setBusy(true);
    try { await signIn(await api.login({ email: email.trim(), password })); } catch (e) { setError(friendlyError(e)); } finally { setBusy(false); }
  };
  return <SafeAreaView style={shared.screen}><Page><View style={{ alignItems: 'center', marginBottom: 36 }}><BrandMark /><Text style={[shared.title, { fontSize: 27, marginTop: 34, textAlign: 'center' }]}>Welcome back</Text><Text style={[shared.body, { marginTop: 8, textAlign: 'center' }]}>Let’s keep your medicines on track.</Text></View><View style={shared.card}><Field autoCapitalize="none" autoComplete="email" keyboardType="email-address" label="Email address" onChangeText={setEmail} placeholder="you@example.com" value={email} /><Field autoCapitalize="none" label="Password" onChangeText={setPassword} placeholder="At least 8 characters" secureTextEntry value={password} />{error ? <Text style={[shared.errorText, { marginBottom: 15 }]}>{error}</Text> : null}<PrimaryButton loading={busy} onPress={submit} title="Sign in" /></View><View style={{ alignItems: 'center', flexDirection: 'row', justifyContent: 'center', marginTop: 24 }}><Text style={shared.body}>New to MediMind? </Text><Pressable onPress={() => navigation.navigate('Register')}><Text style={{ color: colors.teal, fontSize: 16, fontWeight: '800' }}>Create account</Text></Pressable></View></Page></SafeAreaView>;
}

function RegisterScreen() {
  const navigation = useNavigation<any>();
  const signIn = useAuthStore((s) => s.signIn);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const submit = async () => {
    setError('');
    if (name.trim().length < 2) return setError('Please tell us your full name.');
    if (!/^\S+@\S+\.\S+$/.test(email)) return setError('Please enter a valid email address.');
    if (password.length < 8) return setError('Your password needs at least 8 characters.');
    setBusy(true);
    try { await signIn(await api.register({ full_name: name.trim(), email: email.trim(), password })); } catch (e) { setError(friendlyError(e)); } finally { setBusy(false); }
  };
  return <SafeAreaView style={shared.screen}><Page><Header title="Create account" onBack={() => navigation.goBack()} /><Text style={[shared.body, { marginBottom: 24 }]}>A few details and we’ll help make every dose easier to remember.</Text><View style={shared.card}><Field label="Full name" onChangeText={setName} placeholder="Your name" value={name} /><Field autoCapitalize="none" autoComplete="email" keyboardType="email-address" label="Email address" onChangeText={setEmail} placeholder="you@example.com" value={email} /><Field autoCapitalize="none" label="Password" onChangeText={setPassword} placeholder="At least 8 characters" secureTextEntry value={password} />{error ? <Text style={[shared.errorText, { marginBottom: 15 }]}>{error}</Text> : null}<PrimaryButton loading={busy} onPress={submit} title="Create my account" /></View></Page></SafeAreaView>;
}

function DashboardScreen() {
  const navigation = useNavigation<any>();
  const token = useAuthStore((s) => s.token)!;
  const user = useAuthStore((s) => s.user);
  const [items, setItems] = useState<TodayItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [workingId, setWorkingId] = useState('');
  const [pushState, setPushState] = useState<'hidden' | 'off' | 'busy' | 'on'>('hidden');
  const [pushError, setPushError] = useState('');
  const todayLabel = useMemo(
    () => new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: '2-digit' }).toUpperCase(),
    [],
  );
  const load = async (pull = false) => {
    pull ? setRefreshing(true) : setLoading(true); setError('');
    try { setItems(await api.today(token)); } catch (e) { setError(friendlyError(e)); } finally { setLoading(false); setRefreshing(false); }
  };
  useEffect(() => { load(); }, []);
  useEffect(() => {
    if (Platform.OS === 'web' && pushSupported()) {
      pushAlreadyEnabled().then((on) => setPushState(on ? 'on' : 'off')).catch(() => setPushState('off'));
    }
  }, []);
  const turnOnPush = async () => {
    setPushState('busy'); setPushError('');
    try { await enablePush(token); setPushState('on'); } catch (e) { setPushError(e instanceof Error ? e.message : friendlyError(e)); setPushState('off'); }
  };
  const mark = async (item: TodayItem, status: 'taken' | 'skipped') => {
    setWorkingId(item.reminder_id);
    try { await api.mark(token, item.reminder_id, status); await load(); } catch (e) { Alert.alert('Could not update dose', friendlyError(e)); } finally { setWorkingId(''); }
  };
  const greeting = user?.full_name ? `Good morning, ${user.full_name.split(' ')[0]}` : 'Good morning';
  return <Page refreshing={refreshing} onRefresh={() => load(true)}><View style={{ alignItems: 'flex-start', flexDirection: 'row', justifyContent: 'space-between', marginBottom: 26 }}><View style={{ flex: 1 }}><Text style={{ color: colors.teal, fontSize: 14, fontWeight: '800', marginBottom: 6 }}>{todayLabel}</Text><Text style={shared.title}>{greeting}</Text><Text style={[shared.body, { marginTop: 6 }]}>Here’s your medication plan for today.</Text></View><View style={{ backgroundColor: colors.amberSoft, borderRadius: 28, padding: 12 }}><Ionicons color="#9B681D" name="sunny-outline" size={25} /></View></View><View style={[shared.card, { backgroundColor: colors.teal, borderColor: colors.teal, marginBottom: 24 }]}><View style={{ alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' }}><View><Text style={{ color: '#BEEBE7', fontSize: 14, fontWeight: '800' }}>TODAY’S CARE PLAN</Text><Text style={{ color: colors.white, fontSize: 25, fontWeight: '900', marginTop: 6 }}>{items.filter((item) => item.status === 'taken').length} of {items.length} doses taken</Text></View><View style={{ alignItems: 'center', borderColor: '#92D8D3', borderRadius: 35, borderWidth: 5, height: 70, justifyContent: 'center', width: 70 }}><Ionicons color={colors.white} name="checkmark" size={32} /></View></View><Pressable onPress={() => navigation.navigate('ReminderSettings')} style={{ alignItems: 'center', flexDirection: 'row', marginTop: 18 }}><Text style={{ color: colors.white, fontSize: 15, fontWeight: '800' }}>Manage reminders</Text><Ionicons color={colors.white} name="arrow-forward" size={18} style={{ marginLeft: 6 }} /></Pressable></View>{pushState !== 'hidden' ? <View style={[shared.card, { marginBottom: 22 }]}>{pushState === 'on' ? <View style={{ alignItems: 'center', flexDirection: 'row' }}><Ionicons color={colors.teal} name="notifications" size={22} /><Text style={{ color: colors.tealDark, flex: 1, fontSize: 15, fontWeight: '800', marginLeft: 10 }}>Reminders are on for this device</Text></View> : <><View style={{ alignItems: 'center', flexDirection: 'row' }}><Ionicons color={colors.teal} name="notifications-outline" size={22} /><Text style={{ flex: 1, fontSize: 15, fontWeight: '800', marginLeft: 10 }}>Get a reminder when it’s time for a dose</Text></View>{pushError ? <Text style={[shared.errorText, { marginTop: 10 }]}>{pushError}</Text> : null}<PrimaryButton loading={pushState === 'busy'} onPress={turnOnPush} style={{ marginTop: 12 }} title="Enable reminders" /></>}</View> : null}<SectionTitle eyebrow="Dose schedule" title="Today’s medicines" subtitle="Take a dose when it’s due, or skip it if needed." />{loading ? <LoadingState label="Loading today’s doses…" /> : error ? <ErrorState message={error} onRetry={() => load()} /> : items.length === 0 ? <EmptyState icon="calendar-outline" title="No doses scheduled today" body="Your day is clear. Add a medicine to start a reminder plan." /> : items.map((item) => <View key={item.reminder_id} style={[shared.card, { marginBottom: 12, opacity: item.status === 'taken' || item.status === 'skipped' ? 0.78 : 1 }]}><View style={{ alignItems: 'flex-start', flexDirection: 'row', justifyContent: 'space-between' }}><View style={{ flex: 1 }}><Text style={{ color: colors.teal, fontSize: 15, fontWeight: '900' }}>{item.time_of_day}</Text><Text style={[shared.h2, { marginTop: 4 }]}>{item.medicine_name}</Text><Text style={[shared.body, { marginTop: 2 }]}>{item.dosage}</Text></View><StatusPill status={item.status} /></View>{item.status === 'pending' ? <View style={{ flexDirection: 'row', marginTop: 18 }}><PrimaryButton style={{ flex: 1, marginRight: 8 }} title="Taken" onPress={() => mark(item, 'taken')} loading={workingId === item.reminder_id} /><SecondaryButton style={{ flex: 1 }} title="Skip" onPress={() => mark(item, 'skipped')} /></View> : null}</View>)}</Page>;
}

function MedicineListScreen() {
  const navigation = useNavigation<any>();
  const token = useAuthStore((s) => s.token)!;
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const load = async (pull = false, query = search) => {
    pull ? setRefreshing(true) : setLoading(true); setError('');
    try { setMedicines(await api.medicines(token, query)); } catch (e) { setError(friendlyError(e)); } finally { setLoading(false); setRefreshing(false); }
  };
  useEffect(() => { load(); }, []);
  return <Page refreshing={refreshing} onRefresh={() => load(true)}><View style={{ alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', marginBottom: 22 }}><Text style={shared.title}>My medicines</Text><IconButton icon="add" label="Add medicine" onPress={() => navigation.navigate('AddMedicine')} /></View><View style={{ flexDirection: 'row', marginBottom: 22 }}><Field autoCapitalize="none" containerStyle={{ flex: 1, marginBottom: 0 }} label="" onChangeText={setSearch} onSubmitEditing={() => load(false, search)} placeholder="Search medicines" returnKeyType="search" value={search} /><Pressable onPress={() => load(false, search)} style={{ alignItems: 'center', backgroundColor: colors.teal, borderRadius: radii.sm, height: 54, justifyContent: 'center', marginLeft: 8, width: 54 }}><Ionicons color={colors.white} name="search" size={23} /></Pressable></View>{loading ? <LoadingState label="Loading your medicines…" /> : error ? <ErrorState message={error} onRetry={() => load()} /> : medicines.length === 0 ? <EmptyState icon="medkit-outline" title={search ? 'No matches found' : 'No medicines yet'} body={search ? 'Try a different medicine name.' : 'Add your first medicine and we’ll keep its schedule close at hand.'} /> : medicines.map((medicine) => <Pressable key={medicine.id} onPress={() => navigation.navigate('ReminderSettings', { medicineId: medicine.id })} style={({ pressed }) => [shared.card, { marginBottom: 12 }, pressed && { borderColor: colors.teal, opacity: 0.85 }]}><View style={{ alignItems: 'center', flexDirection: 'row' }}><View style={{ alignItems: 'center', backgroundColor: colors.tealSoft, borderRadius: 24, height: 48, justifyContent: 'center', width: 48 }}><Ionicons color={colors.teal} name="medical-outline" size={24} /></View><View style={{ flex: 1, marginLeft: 14 }}><Text style={shared.h2}>{medicine.name}</Text><Text style={[shared.body, { marginTop: 2 }]}>{medicine.dosage} • {medicine.frequency_per_day} {medicine.frequency_per_day === 1 ? 'time' : 'times'} daily</Text></View><Ionicons color={colors.inkMuted} name="chevron-forward" size={21} /></View>{medicine.instructions ? <Text style={[shared.caption, { marginLeft: 62, marginTop: 9 }]}>{medicine.instructions}</Text> : null}</Pressable>)}</Page>;
}

function AddMedicineScreen() {
  const navigation = useNavigation<any>();
  const token = useAuthStore((s) => s.token)!;
  const [name, setName] = useState('');
  const [dosage, setDosage] = useState('');
  const [form, setForm] = useState('tablet');
  const [times, setTimes] = useState(['08:00']);
  const [instructions, setInstructions] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const validTime = (time: string) => /^([01]\d|2[0-3]):[0-5]\d$/.test(time);
  const submit = async () => {
    setError('');
    if (!name.trim()) return setError('Please enter the medicine name.');
    if (!dosage.trim()) return setError('Please enter the dosage, for example 500 mg.');
    if (times.some((time) => !validTime(time))) return setError('Times must use 24-hour format, like 08:00 or 20:30.');
    setBusy(true);
    try { await api.addMedicine(token, { name: name.trim(), dosage: dosage.trim(), form: form.trim() || 'tablet', frequency_per_day: times.length, start_date: new Date().toISOString().slice(0, 10), instructions: instructions.trim(), reminder_times: times, days_of_week: [1, 2, 3, 4, 5, 6, 7] }); navigation.goBack(); } catch (e) { setError(friendlyError(e)); } finally { setBusy(false); }
  };
  return <Page><Header title="Add medicine" onBack={() => navigation.goBack()} /><Text style={[shared.body, { marginBottom: 22 }]}>We’ll create a reminder for each time you add.</Text><View style={shared.card}><Field label="Medicine name" onChangeText={setName} placeholder="e.g. Metformin" value={name} /><Field label="Dosage" onChangeText={setDosage} placeholder="e.g. 500 mg" value={dosage} /><Field label="Form" onChangeText={setForm} placeholder="e.g. tablet, capsule" value={form} /><Text style={shared.label}>Reminder times</Text>{times.map((time, index) => <View key={index} style={{ alignItems: 'center', flexDirection: 'row', marginBottom: 10 }}><TextInputTime value={time} onChange={(value) => setTimes(times.map((current, i) => i === index ? value : current))} /><Pressable accessibilityLabel={`Remove time ${index + 1}`} disabled={times.length === 1} onPress={() => setTimes(times.filter((_, i) => i !== index))} style={{ marginLeft: 10, opacity: times.length === 1 ? 0.3 : 1 }}><Ionicons color={colors.red} name="trash-outline" size={23} /></Pressable></View>)}<SecondaryButton title="Add another time" onPress={() => setTimes([...times, '20:00'])} style={{ marginBottom: 18 }} /><Field label="Instructions (optional)" multiline onChangeText={setInstructions} placeholder="e.g. Take after food" value={instructions} />{error ? <Text style={[shared.errorText, { marginBottom: 15 }]}>{error}</Text> : null}<PrimaryButton loading={busy} onPress={submit} title="Save medicine" /></View></Page>;
}

function TextInputTime({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return <View style={{ alignItems: 'center', backgroundColor: colors.mint, borderColor: colors.line, borderRadius: radii.sm, borderWidth: 1, flex: 1, flexDirection: 'row', height: 54, paddingHorizontal: 16 }}><Ionicons color={colors.teal} name="time-outline" size={22} /><TextInput accessibilityLabel="Reminder time" keyboardType="numbers-and-punctuation" maxLength={5} onChangeText={onChange} placeholder="08:00" placeholderTextColor="#89A0A7" style={{ color: colors.ink, flex: 1, fontSize: 18, fontWeight: '800', marginLeft: 11 }} value={value} /></View>;
}

function ReminderSettingsScreen() {
  const navigation = useNavigation<any>();
  const token = useAuthStore((s) => s.token)!;
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState('');
  const load = async (pull = false) => {
    pull ? setRefreshing(true) : setLoading(true); setError('');
    try { setReminders(await api.reminders(token)); } catch (e) { setError(friendlyError(e)); } finally { setLoading(false); setRefreshing(false); }
  };
  useEffect(() => { load(); }, []);
  const update = async (reminder: Reminder, body: { time_of_day?: string; is_enabled?: boolean }) => {
    setBusyId(reminder.id);
    try { const updated = await api.updateReminder(token, reminder.id, body); setReminders((all) => all.map((item) => item.id === reminder.id ? { ...item, ...updated } : item)); } catch (e) { Alert.alert('Could not update reminder', friendlyError(e)); } finally { setBusyId(''); }
  };
  return <Page refreshing={refreshing} onRefresh={() => load(true)}><Header title="Reminder settings" onBack={() => navigation.goBack()} /><Text style={[shared.body, { marginBottom: 22 }]}>Choose when your reminders should reach you.</Text>{loading ? <LoadingState label="Loading reminder settings…" /> : error ? <ErrorState message={error} onRetry={() => load()} /> : reminders.length === 0 ? <EmptyState icon="notifications-outline" title="No reminders to manage" body="Add a medicine first and its reminder times will appear here." /> : reminders.map((reminder) => <View key={reminder.id} style={[shared.card, { marginBottom: 12 }]}><View style={{ alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' }}><View style={{ flex: 1 }}><Text style={shared.h2}>{reminder.medicine_name || 'Medicine reminder'}</Text><Text style={[shared.body, { marginTop: 3 }]}>{reminder.time_of_day}</Text></View><Pressable accessibilityRole="switch" accessibilityState={{ checked: reminder.is_enabled }} disabled={busyId === reminder.id} onPress={() => update(reminder, { is_enabled: !reminder.is_enabled })} style={{ backgroundColor: reminder.is_enabled ? colors.teal : '#B9C7CA', borderRadius: 16, height: 32, justifyContent: 'center', padding: 3, width: 52 }}><View style={{ alignSelf: reminder.is_enabled ? 'flex-end' : 'flex-start', backgroundColor: colors.white, borderRadius: 13, height: 26, width: 26 }} /></Pressable></View><View style={{ alignItems: 'center', flexDirection: 'row', marginTop: 16 }}><TextInputTime value={reminder.time_of_day} onChange={(value) => setReminders((all) => all.map((item) => item.id === reminder.id ? { ...item, time_of_day: value } : item))} /><SecondaryButton title="Save time" onPress={() => /^([01]\d|2[0-3]):[0-5]\d$/.test(reminder.time_of_day) ? update(reminder, { time_of_day: reminder.time_of_day }) : Alert.alert('Check the time', 'Use 24-hour format, like 08:00.')} style={{ marginLeft: 10 }} /></View></View>)}</Page>;
}

function ProfileScreen() {
  const navigation = useNavigation<any>();
  const token = useAuthStore((s) => s.token)!;
  const storedUser = useAuthStore((s) => s.user);
  const signOut = useAuthStore((s) => s.signOut);
  const [user, setUser] = useState<User | null>(storedUser);
  const [stats, setStats] = useState<AdherenceStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [name, setName] = useState(storedUser?.full_name || '');
  const [phone, setPhone] = useState(storedUser?.phone || '');
  const [dob, setDob] = useState(storedUser?.date_of_birth || '');
  const [caretaker, setCaretaker] = useState<FamilyMember | null>(null);
  const [showCaretakerForm, setShowCaretakerForm] = useState(false);
  const [ckName, setCkName] = useState('');
  const [ckRelation, setCkRelation] = useState('');
  const [ckPhone, setCkPhone] = useState('');
  const [ckEmail, setCkEmail] = useState('');
  const [ckBusy, setCkBusy] = useState(false);
  const [ckError, setCkError] = useState('');
  const load = async (pull = false) => {
    pull ? setRefreshing(true) : setLoading(true); setError('');
    try { const [profile, adherence] = await Promise.all([api.profile(token), api.stats(token)]); setUser(profile.user); setName(profile.user.full_name); setPhone(profile.user.phone || ''); setDob(profile.user.date_of_birth || ''); setStats(adherence); const caretakerResult = await api.caretaker(token).catch(() => null); setCaretaker(caretakerResult); } catch (e) { setError(friendlyError(e)); } finally { setLoading(false); setRefreshing(false); }
  };
  useEffect(() => { load(); }, []);
  const save = async () => { if (!name.trim()) return setError('Please enter your full name.'); setSaving(true); setError(''); try { const result = await api.updateProfile(token, { full_name: name.trim(), phone: phone.trim() || null, date_of_birth: dob.trim() || null }); setUser(result.user); Alert.alert('Profile saved', 'Your details are up to date.'); } catch (e) { setError(friendlyError(e)); } finally { setSaving(false); } };
  const saveCaretaker = async () => {
    setCkError('');
    if (!ckName.trim()) return setCkError('Please enter the caretaker name.');
    if (ckEmail.trim() && !/^\S+@\S+\.\S+$/.test(ckEmail.trim())) return setCkError('Please enter a valid email, or leave it empty.');
    setCkBusy(true);
    try {
      const member = await api.addFamilyMember(token, { name: ckName.trim(), relation: ckRelation.trim() || null, phone: ckPhone.trim() || null, email: ckEmail.trim() || null, can_view_adherence: true });
      setCaretaker(member); setShowCaretakerForm(false); setCkName(''); setCkRelation(''); setCkPhone(''); setCkEmail('');
    } catch (e) { setCkError(friendlyError(e)); } finally { setCkBusy(false); }
  };
  if (loading) return <Page><Header title="My profile" /><LoadingState label="Loading your profile…" /></Page>;
  if (error && !user) return <Page><Header title="My profile" /><ErrorState message={error} onRetry={() => load()} /></Page>;
  return <Page refreshing={refreshing} onRefresh={() => load(true)}><Header title="My profile" /><View style={{ alignItems: 'center', marginBottom: 24 }}><View style={{ alignItems: 'center', backgroundColor: colors.tealSoft, borderRadius: 44, height: 88, justifyContent: 'center', width: 88 }}><Text style={{ color: colors.tealDark, fontSize: 32, fontWeight: '900' }}>{(user?.full_name || 'M').charAt(0).toUpperCase()}</Text></View><Text style={[shared.h2, { marginTop: 12 }]}>{user?.full_name}</Text><Text style={shared.body}>{user?.email}</Text></View>{stats ? <View style={[shared.card, { marginBottom: 20 }]}><Text style={[shared.h2, { marginBottom: 16 }]}>Your adherence</Text><View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>{[['rate_percent', `${stats.rate_percent}%`, 'on track'], ['streak_days', `${stats.streak_days}`, 'day streak'], ['taken', `${stats.taken}`, 'taken']].map(([key, value, label]) => <View key={key} style={{ alignItems: 'center', flex: 1 }}><Text style={{ color: colors.teal, fontSize: 27, fontWeight: '900' }}>{value}</Text><Text style={[shared.caption, { marginTop: 3 }]}>{label}</Text></View>)}</View></View> : <EmptyState icon="stats-chart-outline" title="No adherence stats yet" body="Your progress will appear after you log a dose." />}{error ? <Text style={[shared.errorText, { marginBottom: 15 }]}>{error}</Text> : null}<View style={shared.card}><Text style={[shared.h2, { marginBottom: 18 }]}>Personal details</Text><Field label="Full name" onChangeText={setName} value={name} /><Field keyboardType="phone-pad" label="Phone (optional)" onChangeText={setPhone} value={phone} /><Field label="Date of birth (optional)" onChangeText={setDob} placeholder="YYYY-MM-DD" value={dob} /><PrimaryButton loading={saving} onPress={save} title="Save changes" /></View><View style={[shared.card, { marginTop: 18 }]}><Text style={[shared.h2, { marginBottom: 6 }]}>Your caretaker</Text><Text style={[shared.body, { marginBottom: 14 }]}>Receives an email alert when you press SOS.</Text>{caretaker ? <View style={{ alignItems: 'center', flexDirection: 'row' }}><View style={{ alignItems: 'center', backgroundColor: colors.tealSoft, borderRadius: 23, height: 46, justifyContent: 'center', width: 46 }}><Ionicons color={colors.teal} name="heart-outline" size={23} /></View><View style={{ flex: 1, marginLeft: 13 }}><Text style={shared.h2}>{caretaker.name}</Text><Text style={[shared.body, { marginTop: 2 }]}>{[caretaker.relation, caretaker.phone, caretaker.email].filter(Boolean).join(' • ')}</Text></View></View> : showCaretakerForm ? <View><Field label="Caretaker name" onChangeText={setCkName} value={ckName} /><Field label="Relation (optional)" onChangeText={setCkRelation} placeholder="e.g. Daughter" value={ckRelation} /><Field keyboardType="phone-pad" label="Phone (optional)" onChangeText={setCkPhone} value={ckPhone} /><Field autoCapitalize="none" keyboardType="email-address" label="Email (for SOS alerts)" onChangeText={setCkEmail} placeholder="caretaker@example.com" value={ckEmail} />{ckError ? <Text style={[shared.errorText, { marginBottom: 12 }]}>{ckError}</Text> : null}<PrimaryButton loading={ckBusy} onPress={saveCaretaker} title="Save caretaker" /><SecondaryButton onPress={() => setShowCaretakerForm(false)} style={{ marginTop: 10 }} title="Cancel" /></View> : <><Text style={[shared.body, { marginBottom: 12 }]}>No caretaker added yet.</Text><SecondaryButton onPress={() => setShowCaretakerForm(true)} title="Add caretaker" /></>}</View><SecondaryButton onPress={() => navigation.navigate('Family')} style={{ marginTop: 12 }} title="Manage family & caretaker" /><SecondaryButton onPress={signOut} title="Sign out" style={{ marginTop: 18 }} /></Page>;
}

function SosScreen() {
  const navigation = useNavigation<any>();
  const token = useAuthStore((s) => s.token)!;
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState('');
  const [caretaker, setCaretaker] = useState<FamilyMember | null>(null);
  const load = async (pull = false) => { pull ? setRefreshing(true) : setLoading(true); setError(''); try { setContacts(await api.contacts(token)); } catch (e) { setError(friendlyError(e)); } finally { setLoading(false); setRefreshing(false); } };
  useEffect(() => { load(); api.caretaker(token).then(setCaretaker).catch(() => setCaretaker(null)); }, []);
  const sendSos = async () => { const ok = await confirmDialog('Send an emergency alert to your caretaker and trusted contacts?'); if (!ok) return; setSent(false); setMessage(''); setSending(true); try { const result = await api.sos(token); setMessage(`Alert sent to ${caretaker?.name || 'your care team'}`); setContacts(result.contacts); setSent(true); } catch (e) { setError(friendlyError(e)); } finally { setSending(false); } };
  const call = (phone: string) => { if (Platform.OS === 'web') window.open(`tel:${phone}`, '_self'); else Linking.openURL(`tel:${phone}`); };
  return <Page refreshing={refreshing} onRefresh={() => load(true)}><View style={{ alignItems: 'center', marginBottom: 24 }}><View style={{ alignItems: 'center', flexDirection: 'row', marginBottom: 19, width: '100%' }}><View style={{ flex: 1 }}><Text style={shared.title}>Emergency SOS</Text><Text style={[shared.body, { marginTop: 6 }]}>One tap to bring your trusted contacts close.</Text></View><View style={{ backgroundColor: colors.redSoft, borderRadius: 24, padding: 12 }}><Ionicons color={colors.red} name="shield-checkmark-outline" size={25} /></View></View><Pressable accessibilityRole="button" disabled={sending} onPress={sendSos} style={({ pressed }) => [{ alignItems: 'center', backgroundColor: colors.coral, borderColor: '#F7B2A1', borderRadius: 120, borderWidth: 8, height: 210, justifyContent: 'center', shadowColor: colors.coralDark, shadowOffset: { height: 8, width: 0 }, shadowOpacity: 0.25, shadowRadius: 14, width: 210 }, pressed && { opacity: 0.84, transform: [{ scale: 0.98 }] }]}><Ionicons color={colors.white} name="alert" size={42} /><Text style={{ color: colors.white, fontSize: 31, fontWeight: '900', marginTop: 5 }}>SOS</Text><Text style={{ color: '#FFE7E1', fontSize: 13, fontWeight: '800', marginTop: 2 }}>TAP FOR HELP</Text></Pressable></View>{sent ? <View style={[shared.card, { backgroundColor: colors.tealSoft, borderColor: '#A8DEDA', marginBottom: 20 }]}><View style={{ alignItems: 'center', flexDirection: 'row' }}><Ionicons color={colors.tealDark} name="checkmark-circle" size={24} /><Text style={{ color: colors.tealDark, flex: 1, fontSize: 16, fontWeight: '800', marginLeft: 10 }}>{message}</Text></View></View> : null}<SectionTitle eyebrow="Trusted contacts" title="Call someone now" subtitle="These are the people your care team can reach in an emergency." /><SecondaryButton onPress={() => navigation.navigate('Contacts')} style={{ marginBottom: 16 }} title="Add / manage contacts" />{loading ? <LoadingState label="Loading emergency contacts…" /> : error ? <ErrorState message={error} onRetry={() => load()} /> : contacts.length === 0 ? <EmptyState icon="people-outline" title="No emergency contacts yet" body="Ask a family member or care partner to be added as a contact." /> : contacts.map((contact, index) => <View key={`${contact.phone}-${index}`} style={[shared.card, { marginBottom: 12 }]}><View style={{ alignItems: 'center', flexDirection: 'row' }}><View style={{ alignItems: 'center', backgroundColor: colors.amberSoft, borderRadius: 23, height: 46, justifyContent: 'center', width: 46 }}><Ionicons color="#9B681D" name="person-outline" size={23} /></View><View style={{ flex: 1, marginLeft: 13 }}><Text style={shared.h2}>{contact.name}</Text><Text style={shared.body}>{contact.relation} • {contact.phone}</Text></View><Pressable accessibilityRole="button" onPress={() => call(contact.phone)} style={{ alignItems: 'center', backgroundColor: colors.teal, borderRadius: radii.sm, flexDirection: 'row', minHeight: 46, paddingHorizontal: 13 }}><Ionicons color={colors.white} name="call" size={18} /><Text style={{ color: colors.white, fontSize: 15, fontWeight: '800', marginLeft: 6 }}>Call now</Text></Pressable></View></View>)}</Page>;
}

function ContactsScreen() {
  const navigation = useNavigation<any>();
  const token = useAuthStore((s) => s.token)!;
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<EmergencyContact | null>(null);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [relation, setRelation] = useState('');
  const [isPrimary, setIsPrimary] = useState(false);
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState('');
  const load = async () => { setLoading(true); setError(''); try { setContacts(await api.contacts(token)); } catch (e) { setError(friendlyError(e)); } finally { setLoading(false); } };
  useEffect(() => { load(); }, []);
  const openNew = () => { setEditing(null); setName(''); setPhone(''); setRelation(''); setIsPrimary(false); setFormError(''); setFormOpen(true); };
  const openEdit = (contact: EmergencyContact) => { setEditing(contact); setName(contact.name); setPhone(contact.phone); setRelation(contact.relation || ''); setIsPrimary(Boolean(contact.is_primary)); setFormError(''); setFormOpen(true); };
  const save = async () => {
    setFormError('');
    if (!name.trim()) return setFormError('Please enter a name.');
    if (!phone.trim()) return setFormError('Please enter a phone number.');
    setBusy(true);
    const body = { name: name.trim(), phone: phone.trim(), relation: relation.trim() || null, is_primary: isPrimary };
    try {
      if (editing?.id) await api.updateContact(token, editing.id, body);
      else await api.addContact(token, body);
      setFormOpen(false);
      await load();
    } catch (e) { setFormError(friendlyError(e)); } finally { setBusy(false); }
  };
  const remove = async (contact: EmergencyContact) => {
    if (!contact.id) return;
    const ok = await confirmDialog(`Remove ${contact.name} from your emergency contacts?`);
    if (!ok) return;
    try { await api.deleteContact(token, contact.id); await load(); } catch (e) { setError(friendlyError(e)); }
  };
  return <Page><Header title="Emergency contacts" onBack={() => navigation.goBack()} /><Text style={[shared.body, { marginBottom: 20 }]}>These people are one tap away when you press SOS. Keep at least one.</Text>{loading ? <LoadingState label="Loading contacts…" /> : error ? <ErrorState message={error} onRetry={load} /> : contacts.length === 0 ? <EmptyState icon="people-outline" title="No emergency contacts yet" body="Add a family member, friend, or doctor so SOS can reach someone." /> : contacts.map((contact) => <View key={contact.id || contact.phone} style={[shared.card, { marginBottom: 12 }]}><View style={{ alignItems: 'center', flexDirection: 'row' }}><View style={{ flex: 1 }}><Text style={shared.h2}>{contact.name}{contact.is_primary ? ' • Primary' : ''}</Text><Text style={[shared.body, { marginTop: 2 }]}>{contact.relation ? `${contact.relation} • ` : ''}{contact.phone}</Text></View><IconButton icon="create-outline" label={`Edit ${contact.name}`} onPress={() => openEdit(contact)} /><IconButton icon="trash-outline" label={`Remove ${contact.name}`} onPress={() => remove(contact)} /></View></View>)}{formOpen ? <View style={[shared.card, { marginBottom: 14 }]}><Text style={[shared.h2, { marginBottom: 14 }]}>{editing?.id ? 'Edit contact' : 'Add contact'}</Text><Field label="Full name" onChangeText={setName} value={name} /><Field keyboardType="phone-pad" label="Phone number" onChangeText={setPhone} value={phone} /><Field label="Relation (optional)" onChangeText={setRelation} placeholder="e.g. Daughter, Doctor" value={relation} /><Pressable accessibilityRole="switch" accessibilityState={{ checked: isPrimary }} onPress={() => setIsPrimary(!isPrimary)} style={{ alignItems: 'center', flexDirection: 'row', marginBottom: 16 }}><View style={{ backgroundColor: isPrimary ? colors.teal : '#B9C7CA', borderRadius: 16, height: 32, justifyContent: 'center', padding: 3, width: 52 }}><View style={{ alignSelf: isPrimary ? 'flex-end' : 'flex-start', backgroundColor: colors.white, borderRadius: 13, height: 26, width: 26 }} /></View><Text style={[shared.body, { marginLeft: 12 }]}>Primary contact</Text></Pressable>{formError ? <Text style={[shared.errorText, { marginBottom: 12 }]}>{formError}</Text> : null}<PrimaryButton loading={busy} onPress={save} title={editing?.id ? 'Save changes' : 'Add contact'} /><SecondaryButton onPress={() => setFormOpen(false)} style={{ marginTop: 10 }} title="Cancel" /></View> : <PrimaryButton onPress={openNew} title="Add emergency contact" /></Page>;
}

function FamilyScreen() {
  const navigation = useNavigation<any>();
  const token = useAuthStore((s) => s.token)!;
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<FamilyMember | null>(null);
  const [name, setName] = useState('');
  const [relation, setRelation] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [canView, setCanView] = useState(false);
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState('');
  const load = async () => { setLoading(true); setError(''); try { setMembers(await api.familyMembers(token)); } catch (e) { setError(friendlyError(e)); } finally { setLoading(false); } };
  useEffect(() => { load(); }, []);
  const openNew = () => { setEditing(null); setName(''); setRelation(''); setPhone(''); setEmail(''); setCanView(false); setFormError(''); setFormOpen(true); };
  const openEdit = (member: FamilyMember) => { setEditing(member); setName(member.name); setRelation(member.relation || ''); setPhone(member.phone || ''); setEmail(member.email || ''); setCanView(member.can_view_adherence); setFormError(''); setFormOpen(true); };
  const save = async () => {
    setFormError('');
    if (!name.trim()) return setFormError('Please enter a name.');
    if (email.trim() && !/^\S+@\S+\.\S+$/.test(email.trim())) return setFormError('Please enter a valid email, or leave it empty.');
    setBusy(true);
    const body = { name: name.trim(), relation: relation.trim() || null, phone: phone.trim() || null, email: email.trim() || null, can_view_adherence: canView };
    try {
      if (editing) await api.updateFamilyMember(token, editing.id, body);
      else await api.addFamilyMember(token, body);
      setFormOpen(false);
      await load();
    } catch (e) { setFormError(friendlyError(e)); } finally { setBusy(false); }
  };
  const remove = async (member: FamilyMember) => {
    const ok = await confirmDialog(`Remove ${member.name} from your family members?`);
    if (!ok) return;
    try { await api.deleteFamilyMember(token, member.id); await load(); } catch (e) { setError(friendlyError(e)); }
  };
  return <Page><Header title="Family & caretaker" onBack={() => navigation.goBack()} /><Text style={[shared.body, { marginBottom: 20 }]}>The caretaker is the family member who gets an email when you press SOS and can view your adherence.</Text>{loading ? <LoadingState label="Loading family members…" /> : error ? <ErrorState message={error} onRetry={load} /> : members.length === 0 ? <EmptyState icon="people-outline" title="No family members yet" body="Add a family member and mark them as your caretaker." /> : members.map((member) => <View key={member.id} style={[shared.card, { marginBottom: 12 }]}><View style={{ alignItems: 'center', flexDirection: 'row' }}><View style={{ alignItems: 'center', backgroundColor: member.can_view_adherence ? colors.tealSoft : colors.amberSoft, borderRadius: 23, height: 46, justifyContent: 'center', width: 46 }}><Ionicons color={member.can_view_adherence ? colors.teal : '#9B681D'} name="heart-outline" size={23} /></View><View style={{ flex: 1, marginLeft: 13 }}><Text style={shared.h2}>{member.name}{member.can_view_adherence ? ' • Caretaker' : ''}</Text><Text style={[shared.body, { marginTop: 2 }]}>{[member.relation, member.phone, member.email].filter(Boolean).join(' • ')}</Text></View><IconButton icon="create-outline" label={`Edit ${member.name}`} onPress={() => openEdit(member)} /><IconButton icon="trash-outline" label={`Remove ${member.name}`} onPress={() => remove(member)} /></View></View>)}{formOpen ? <View style={[shared.card, { marginBottom: 14 }]}><Text style={[shared.h2, { marginBottom: 14 }]}>{editing ? 'Edit family member' : 'Add family member'}</Text><Field label="Full name" onChangeText={setName} value={name} /><Field label="Relation (optional)" onChangeText={setRelation} placeholder="e.g. Daughter, Son" value={relation} /><Field keyboardType="phone-pad" label="Phone (optional)" onChangeText={setPhone} value={phone} /><Field autoCapitalize="none" keyboardType="email-address" label="Email (optional, for SOS alerts)" onChangeText={setEmail} value={email} /><Pressable accessibilityRole="switch" accessibilityState={{ checked: canView }} onPress={() => setCanView(!canView)} style={{ alignItems: 'center', flexDirection: 'row', marginBottom: 16 }}><View style={{ backgroundColor: canView ? colors.teal : '#B9C7CA', borderRadius: 16, height: 32, justifyContent: 'center', padding: 3, width: 52 }}><View style={{ alignSelf: canView ? 'flex-end' : 'flex-start', backgroundColor: colors.white, borderRadius: 13, height: 26, width: 26 }} /></View><Text style={[shared.body, { marginLeft: 12 }]}>Caretaker (SOS emails + view adherence)</Text></Pressable>{formError ? <Text style={[shared.errorText, { marginBottom: 12 }]}>{formError}</Text> : null}<PrimaryButton loading={busy} onPress={save} title={editing ? 'Save changes' : 'Add family member'} /><SecondaryButton onPress={() => setFormOpen(false)} style={{ marginTop: 10 }} title="Cancel" /></View> : <PrimaryButton onPress={openNew} title="Add family member" /></Page>;
}

function TabNavigator() {
  return <Tab.Navigator screenOptions={({ route }) => ({ headerShown: false, tabBarActiveTintColor: colors.teal, tabBarInactiveTintColor: colors.inkMuted, tabBarLabelStyle: { fontSize: 12, fontWeight: '700', paddingBottom: 3 }, tabBarStyle: { borderTopColor: colors.line, height: 68, paddingTop: 7 }, tabBarIcon: ({ color, size }) => { const icons: Record<string, keyof typeof Ionicons.glyphMap> = { Today: 'calendar-outline', Medicines: 'medkit-outline', SOS: 'alert-circle-outline', Profile: 'person-circle-outline' }; return <Ionicons color={color} name={icons[route.name]} size={size} />; } })}><Tab.Screen name="Today" component={DashboardScreen} /><Tab.Screen name="Medicines" component={MedicineListScreen} /><Tab.Screen name="SOS" component={SosScreen} /><Tab.Screen name="Profile" component={ProfileScreen} /></Tab.Navigator>;
}

function AuthenticatedStack() {
  return <AppStack.Navigator screenOptions={{ headerShown: false }}><AppStack.Screen name="MainTabs" component={TabNavigator} /><AppStack.Screen name="AddMedicine" component={AddMedicineScreen} /><AppStack.Screen name="ReminderSettings" component={ReminderSettingsScreen} /><AppStack.Screen name="Contacts" component={ContactsScreen} /><AppStack.Screen name="Family" component={FamilyScreen} /></AppStack.Navigator>;
}

export default function App() {
  const token = useAuthStore((s) => s.token);
  const hydrate = useAuthStore((s) => s.hydrate);
  const [booted, setBooted] = useState(false);
  const [bootError, setBootError] = useState('');
  const check = async () => { setBootError(''); setBooted(false); try { await hydrate(); } catch (e) { setBootError(friendlyError(e)); } finally { setBooted(true); } };
  useEffect(() => { check(); }, []);
  if (!booted) return <Splash error={bootError} onRetry={check} />;
  return <NavigationContainer>{token ? <AuthenticatedStack /> : <AuthStack.Navigator screenOptions={{ headerShown: false }}><AuthStack.Screen name="Login" component={LoginScreen} /><AuthStack.Screen name="Register" component={RegisterScreen} /></AuthStack.Navigator>}</NavigationContainer>;
}
