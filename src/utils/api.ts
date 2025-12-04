const isProd = (import.meta as any).env?.MODE === 'production' || (import.meta as any).env?.PROD
const DEFAULT_BASE = (import.meta as any).env?.VITE_API_BASE_URL ?? (isProd ? '' : 'http://localhost:3002')

export const apiUrl = (path: string) => `${DEFAULT_BASE}${path}`
