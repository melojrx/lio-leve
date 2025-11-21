// Centralização das variáveis de ambiente do frontend
// Fornece defaults seguros para desenvolvimento.

export const API_BASE_URL = (import.meta.env.VITE_API_URL as string) || 'http://localhost:8000';
export const APP_NAME = import.meta.env.VITE_APP_NAME || 'investiorion.com.br';
export const POLL_INTERVAL_DEFAULT = Number(import.meta.env.VITE_POLL_INTERVAL_DEFAULT) || 10000;
export const ENABLE_MOCKS = String(import.meta.env.VITE_ENABLE_MOCKS).toLowerCase() === 'true';

// Pequena função utilitária para logar config em dev (não em prod)
export function logEnvSummary() {
  if (import.meta.env.DEV) {
    console.info('[env]', { API_BASE_URL, APP_NAME, POLL_INTERVAL_DEFAULT, ENABLE_MOCKS });
  }
}
