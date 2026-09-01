import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

const TOKEN_KEY = 'medimind_jwt';

export async function getStoredToken() {
  if (Platform.OS === 'web') return window.localStorage.getItem(TOKEN_KEY);
  return SecureStore.getItemAsync(TOKEN_KEY);
}

export async function setStoredToken(token: string) {
  if (Platform.OS === 'web') window.localStorage.setItem(TOKEN_KEY, token);
  else await SecureStore.setItemAsync(TOKEN_KEY, token);
}

export async function clearStoredToken() {
  if (Platform.OS === 'web') window.localStorage.removeItem(TOKEN_KEY);
  else await SecureStore.deleteItemAsync(TOKEN_KEY);
}