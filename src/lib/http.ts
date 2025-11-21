import { API_BASE_URL } from '@/config/env';

type TokenPair = {
  access_token: string;
  refresh_token: string;
};

const ACCESS_TOKEN_KEY = 'investorion.access_token';
const REFRESH_TOKEN_KEY = 'investorion.refresh_token';

const withBaseUrl = (path: string) => {
  const normalized = API_BASE_URL.replace(/\/+$/, '');
  return path.startsWith('/') ? `${normalized}${path}` : `${normalized}/${path}`;
};

const readToken = (key: string) => {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem(key);
};

export function getStoredTokens(): TokenPair | null {
  const access_token = readToken(ACCESS_TOKEN_KEY);
  const refresh_token = readToken(REFRESH_TOKEN_KEY);
  if (!access_token || !refresh_token) return null;
  return { access_token, refresh_token };
}

export function saveTokens(tokens: TokenPair) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(ACCESS_TOKEN_KEY, tokens.access_token);
  window.localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refresh_token);
}

export function clearTokens() {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(ACCESS_TOKEN_KEY);
  window.localStorage.removeItem(REFRESH_TOKEN_KEY);
}

async function tryRefreshToken(): Promise<boolean> {
  const refresh_token = readToken(REFRESH_TOKEN_KEY);
  if (!refresh_token) return false;

  const response = await fetch(withBaseUrl('/api/v1/auth/refresh'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh_token }),
  });

  if (!response.ok) {
    clearTokens();
    return false;
  }

  const data = await response.json();
  if (data?.access_token && data?.refresh_token) {
    saveTokens({ access_token: data.access_token, refresh_token: data.refresh_token });
    return true;
  }

  return false;
}

async function parseError(response: Response): Promise<string> {
  try {
    const data = await response.json();
    if (typeof data?.detail === 'string') return data.detail;
    if (Array.isArray(data?.detail) && data.detail[0]?.msg) return data.detail[0].msg;
    if (data?.message) return data.message;
  } catch {
    // ignore
  }
  return `Erro ${response.status} ao chamar a API`;
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
  allowRetry = true
): Promise<T> {
  const headers = new Headers(options.headers || {});
  const accessToken = readToken(ACCESS_TOKEN_KEY);

  if (options.body && !(options.body instanceof FormData) && !(options.body instanceof URLSearchParams)) {
    headers.set('Content-Type', headers.get('Content-Type') || 'application/json');
  }

  if (accessToken && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${accessToken}`);
  }

  const response = await fetch(withBaseUrl(path.startsWith('/api') ? path : `/api/v1${path}`), {
    ...options,
    headers,
  });

  const hasRefreshToken = !!readToken(REFRESH_TOKEN_KEY);

  if (response.status === 401 && allowRetry && hasRefreshToken) {
    const refreshed = await tryRefreshToken();
    if (refreshed) {
      return apiFetch<T>(path, options, false);
    }
    clearTokens();
    throw new Error('Sessão expirada. Faça login novamente.');
  }

  if (response.status === 204) {
    return undefined as T;
  }

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  const text = await response.text();
  if (!text) return undefined as T;
  try {
    return JSON.parse(text) as T;
  } catch {
    return text as unknown as T;
  }
}

export function getApiBaseUrl() {
  return API_BASE_URL;
}
