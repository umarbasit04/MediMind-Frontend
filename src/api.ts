import { AdherenceStats, AuthResponse, EmergencyContact, Medicine, Reminder, TodayItem, User } from './types';

const baseUrl = (process.env.EXPO_PUBLIC_API_URL || '').replace(/\/$/, '');

export class ApiError extends Error {
  code: string;
  status: number;
  constructor(message: string, code = 'internal', status = 0) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.status = status;
  }
}

async function request<T>(path: string, options: RequestInit = {}, token?: string): Promise<T> {
  if (!baseUrl) {
    throw new ApiError('Your backend URL is not connected yet. Add EXPO_PUBLIC_API_URL and try again.', 'internal');
  }
  const headers = new Headers(options.headers);
  headers.set('Content-Type', 'application/json');
  if (token) headers.set('Authorization', `Bearer ${token}`);
  let response: Response;
  try {
    response = await fetch(`${baseUrl}${path}`, { ...options, headers });
  } catch {
    throw new ApiError('We could not reach MediMind right now. Check your connection and try again.', 'internal');
  }
  let payload: { data?: T; error?: { code?: string; message?: string } } = {};
  try {
    payload = await response.json();
  } catch {
    throw new ApiError('The server sent an unexpected response. Please try again.', 'internal', response.status);
  }
  if (!response.ok || payload.error) {
    throw new ApiError(
      payload.error?.message || 'Something went wrong. Please try again.',
      payload.error?.code || 'internal',
      response.status,
    );
  }
  return payload.data as T;
}

export const api = {
  login: (body: { email: string; password: string }) =>
    request<AuthResponse>('/api/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  register: (body: { full_name: string; email: string; password: string }) =>
    request<AuthResponse>('/api/auth/register', { method: 'POST', body: JSON.stringify(body) }),
  me: (token: string) => request<{ user: User }>('/api/auth/me', {}, token),
  today: (token: string) => request<TodayItem[]>('/api/reminders/today', {}, token),
  medicines: (token: string, search = '') =>
    request<Medicine[]>(`/api/medicines${search ? `?search=${encodeURIComponent(search)}` : ''}`, {}, token),
  medicine: (token: string, id: string) => request<Medicine>(`/api/medicines/${id}`, {}, token),
  addMedicine: (token: string, body: Record<string, unknown>) =>
    request<Medicine>('/api/medicines', { method: 'POST', body: JSON.stringify(body) }, token),
  reminders: (token: string) => request<Reminder[]>('/api/reminders', {}, token),
  updateReminder: (token: string, id: string, body: { time_of_day?: string; is_enabled?: boolean }) =>
    request<Reminder>(`/api/reminders/${id}`, { method: 'PUT', body: JSON.stringify(body) }, token),
  mark: (token: string, reminderId: string, status: 'taken' | 'skipped') =>
    request<{ log_id: string; status: string; taken_at: string }>(
      `/api/adherence/${reminderId}/mark`,
      { method: 'POST', body: JSON.stringify({ status }) },
      token,
    ),
  profile: (token: string) => request<{ user: User }>('/api/profile', {}, token),
  updateProfile: (token: string, body: { full_name?: string; phone?: string | null; date_of_birth?: string | null }) =>
    request<{ user: User }>('/api/profile', { method: 'PUT', body: JSON.stringify(body) }, token),
  stats: (token: string) => request<AdherenceStats>('/api/adherence/stats', {}, token),
  contacts: (token: string) => request<EmergencyContact[]>('/api/emergency-contacts', {}, token),
  sos: (token: string) =>
    request<{ message: string; contacts: Array<{ name: string; phone: string; relation: string }> }>(
      '/api/sos',
      { method: 'POST', body: JSON.stringify({}) },
      token,
    ),
};