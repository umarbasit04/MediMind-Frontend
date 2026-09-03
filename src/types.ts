export type User = {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  date_of_birth: string | null;
  profile_picture_url: string | null;
  created_at: string;
};

export type Reminder = {
  id: string;
  time_of_day: string;
  days_of_week: number[];
  is_enabled: boolean;
  medicine_name?: string;
  medicine_id?: string;
};

export type Medicine = {
  id: string;
  name: string;
  dosage: string;
  form: string;
  frequency_per_day: number;
  start_date: string;
  end_date: string | null;
  instructions: string | null;
  is_active: boolean;
  reminders: Reminder[];
};

export type TodayItem = {
  reminder_id: string;
  medicine_id: string;
  medicine_name: string;
  dosage: string;
  time_of_day: string;
  status: 'pending' | 'taken' | 'missed' | 'skipped';
  log_id: string | null;
};

export type AdherenceStats = {
  taken: number;
  missed: number;
  skipped: number;
  rate_percent: number;
  streak_days: number;
};

export type EmergencyContact = {
  id?: string;
  name: string;
  phone: string;
  relation: string;
  is_primary?: boolean;
};

export type FamilyMember = {
  id: string;
  name: string;
  relation: string | null;
  email: string | null;
  phone: string | null;
  can_view_adherence: boolean;
  created_at: string;
};

export type AuthResponse = { user: User; token: string };
