/** config.ts — runtime configuration. */
import Constants from 'expo-constants';
import { Platform } from 'react-native';

/**
 * Host of the machine running Metro. On a phone this is the Mac's LAN address,
 * which is the only way the device can reach APIs on this computer.
 */
function devMachineHost(): string | undefined {
  const raw =
    Constants.expoGoConfig?.debuggerHost ??
    (Constants.expoConfig as { hostUri?: string } | null)?.hostUri;
  const host = raw?.split(':')[0];
  if (!host || host === 'localhost' || host === '127.0.0.1') return undefined;
  return host;
}

/** Base URL for a service on this computer, reachable from Expo Go on a phone. */
export function devServerOrigin(port: number): string {
  const host = devMachineHost();
  if (host) return `http://${host}:${port}`;
  if (Platform.OS === 'android') return `http://10.0.2.2:${port}`;
  return `http://localhost:${port}`;
}

/**
 * Resolve the API base URL. Priority:
 *  1. EXPO_PUBLIC_API_URL env var when it is not localhost
 *  2. app.json `extra.apiUrl` when it is not localhost
 *  3. the Metro machine address (physical devices), then localhost
 */
const fromEnv = process.env.EXPO_PUBLIC_API_URL;
const fromExtra = (Constants.expoConfig?.extra as { apiUrl?: string } | undefined)?.apiUrl;
const explicit = (fromEnv || fromExtra || '').replace(/\/+$/, '');

export const API_URL =
  explicit && !/localhost|127\.0\.0\.1/.test(explicit) ? explicit : devServerOrigin(8000);

export const REQUEST_TIMEOUT_MS = 30000;
export const HISTORY_PAGE_SIZE = 15;
export const MAX_IMAGE_BYTES = 12 * 1024 * 1024; // 12 MB

/** Turn a relative `/outputs/<file>` path from the API into an absolute URL. */
export function absoluteImageUrl(path?: string | null): string | undefined {
  if (!path) return undefined;
  if (path.startsWith('http')) return path;
  return `${API_URL}${path.startsWith('/') ? '' : '/'}${path}`;
}
