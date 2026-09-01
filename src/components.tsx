import { Ionicons } from '@expo/vector-icons';
import { ReactNode } from 'react';
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleProp,
  Text,
  TextInput,
  TextInputProps,
  View,
  ViewStyle,
} from 'react-native';
import { colors, radii, shared } from './theme';

export function BrandMark({ small = false }: { small?: boolean }) {
  return (
    <View style={{ alignItems: 'center', flexDirection: 'row' }}>
      <View style={{ alignItems: 'center', backgroundColor: colors.teal, borderRadius: small ? 9 : 12, height: small ? 30 : 40, justifyContent: 'center', width: small ? 30 : 40 }}>
        <Ionicons color={colors.white} name="medical" size={small ? 16 : 22} />
      </View>
      <Text style={{ color: colors.ink, fontSize: small ? 18 : 24, fontWeight: '900', marginLeft: 10 }}>MediMind</Text>
    </View>
  );
}

export function PrimaryButton({ title, onPress, loading = false, disabled = false, style }: { title: string; onPress: () => void; loading?: boolean; disabled?: boolean; style?: StyleProp<ViewStyle> }) {
  return (
    <Pressable accessibilityRole="button" disabled={disabled || loading} onPress={onPress} style={({ pressed }) => [shared.primaryButton, style, (disabled || loading) && { opacity: 0.6 }, pressed && !disabled && { opacity: 0.85 }]}>
      {loading ? <ActivityIndicator color={colors.white} /> : <Text style={shared.primaryButtonText}>{title}</Text>}
    </Pressable>
  );
}

export function SecondaryButton({ title, onPress, style }: { title: string; onPress: () => void; style?: StyleProp<ViewStyle> }) {
  return <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => [shared.secondaryButton, style, pressed && { opacity: 0.78 }]}><Text style={shared.secondaryButtonText}>{title}</Text></Pressable>;
}

export function Field({ label, error, containerStyle, ...props }: TextInputProps & { label: string; error?: string; containerStyle?: StyleProp<ViewStyle> }) {
  return (
    <View style={[{ marginBottom: 17 }, containerStyle]}>
      <Text style={shared.label}>{label}</Text>
      <TextInput placeholderTextColor="#89A0A7" {...props} style={[shared.input, props.multiline && { minHeight: 92, textAlignVertical: 'top' }, props.style]} />
      {error ? <Text style={{ color: colors.red, fontSize: 13, marginTop: 5 }}>{error}</Text> : null}
    </View>
  );
}

export function SectionTitle({ eyebrow, title, subtitle, right }: { eyebrow?: string; title: string; subtitle?: string; right?: ReactNode }) {
  return (
    <View style={{ marginBottom: 20 }}>
      <View style={{ alignItems: 'flex-start', flexDirection: 'row', justifyContent: 'space-between' }}>
        <View style={{ flex: 1 }}>
          {eyebrow ? <Text style={{ color: colors.teal, fontSize: 13, fontWeight: '900', letterSpacing: 1, marginBottom: 6, textTransform: 'uppercase' }}>{eyebrow}</Text> : null}
          <Text style={shared.title}>{title}</Text>
          {subtitle ? <Text style={[shared.body, { marginTop: 6 }]}>{subtitle}</Text> : null}
        </View>
        {right}
      </View>
    </View>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <View style={[shared.card, { alignItems: 'center', marginVertical: 14, padding: 28 }]}>
      <View style={{ alignItems: 'center', backgroundColor: colors.redSoft, borderRadius: 28, height: 56, justifyContent: 'center', marginBottom: 14, width: 56 }}><Ionicons color={colors.red} name="alert-circle-outline" size={28} /></View>
      <Text style={[shared.h2, { marginBottom: 7, textAlign: 'center' }]}>Couldn’t load this yet</Text>
      <Text style={[shared.errorText, { marginBottom: 17 }]}>{message}</Text>
      <SecondaryButton title="Try again" onPress={onRetry} />
    </View>
  );
}

export function LoadingState({ label = 'Loading your medicines…' }: { label?: string }) {
  return <View style={{ alignItems: 'center', justifyContent: 'center', minHeight: 190 }}><ActivityIndicator color={colors.teal} size="large" /><Text style={[shared.body, { marginTop: 14 }]}>{label}</Text></View>;
}

export function EmptyState({ title, body, icon = 'file-tray-outline' }: { title: string; body: string; icon?: keyof typeof Ionicons.glyphMap }) {
  return <View style={[shared.card, { alignItems: 'center', marginVertical: 10, padding: 30 }]}><Ionicons color={colors.teal} name={icon} size={38} /><Text style={[shared.h2, { marginTop: 13, textAlign: 'center' }]}>{title}</Text><Text style={[shared.body, { marginTop: 7, textAlign: 'center' }]}>{body}</Text></View>;
}

export function Page({ children, refreshing, onRefresh }: { children: ReactNode; refreshing?: boolean; onRefresh?: () => void }) {
  return <ScrollView contentContainerStyle={[shared.container, shared.scrollContent, { paddingTop: 28 }]} refreshControl={onRefresh ? <RefreshControl refreshing={!!refreshing} onRefresh={onRefresh} tintColor={colors.teal} colors={[colors.teal]} /> : undefined} keyboardShouldPersistTaps="handled">{children}</ScrollView>;
}

export function StatusPill({ status }: { status: string }) {
  const map: Record<string, { bg: string; fg: string; icon: keyof typeof Ionicons.glyphMap; label: string }> = {
    pending: { bg: colors.amberSoft, fg: '#8A5A13', icon: 'time-outline', label: 'Due' },
    taken: { bg: colors.tealSoft, fg: colors.tealDark, icon: 'checkmark-circle', label: 'Taken' },
    skipped: { bg: '#EEF0F1', fg: colors.inkMuted, icon: 'arrow-forward-circle-outline', label: 'Skipped' },
    missed: { bg: colors.redSoft, fg: colors.red, icon: 'alert-circle-outline', label: 'Missed' },
  };
  const item = map[status] || map.pending;
  return <View style={{ alignItems: 'center', backgroundColor: item.bg, borderRadius: radii.pill, flexDirection: 'row', paddingHorizontal: 10, paddingVertical: 6 }}><Ionicons color={item.fg} name={item.icon} size={15} /><Text style={{ color: item.fg, fontSize: 13, fontWeight: '800', marginLeft: 5 }}>{item.label}</Text></View>;
}

export function IconButton({ icon, label, onPress }: { icon: keyof typeof Ionicons.glyphMap; label: string; onPress: () => void }) {
  return <Pressable accessibilityLabel={label} accessibilityRole="button" onPress={onPress} style={({ pressed }) => [{ alignItems: 'center', backgroundColor: colors.tealSoft, borderRadius: 22, height: 44, justifyContent: 'center', width: 44 }, pressed && { opacity: 0.75 }]}><Ionicons color={colors.tealDark} name={icon} size={22} /></Pressable>;
}