import { Platform } from 'react-native';

const configuredApiUrl = process.env.EXPO_PUBLIC_API_URL?.trim();

export const API_BASE_URL =
  configuredApiUrl ||
  (Platform.OS === 'android' ? 'http://10.0.2.2:3001/api' : 'http://localhost:3001/api');

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
  token?: string,
): Promise<T> {
  const headers = new Headers(options.headers as HeadersInit | undefined);

  if (!headers.has('Content-Type') && options.body) {
    headers.set('Content-Type', 'application/json');
  }

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers,
    });
  } catch (error) {
    const reason = error instanceof Error ? error.message : 'Network request failed.';
    throw new Error(
      `Cannot reach the EventHub API at ${API_BASE_URL}. Start the server and check the device API URL. (${reason})`,
    );
  }

  const text = await response.text();
  let data: { message?: string } = {};
  if (text) {
    try {
      data = JSON.parse(text) as { message?: string };
    } catch {
      throw new Error(`The EventHub API returned an invalid response (${response.status}).`);
    }
  }

  if (!response.ok) {
    throw new Error(data?.message ?? 'Request failed.');
  }

  return data as T;
}
