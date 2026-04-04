const KEY = 'harness_anthropic_api_key'

export function getApiKey(): string | null {
  return localStorage.getItem(KEY)
}

export function setApiKey(key: string): void {
  localStorage.setItem(KEY, key)
}

export function clearApiKey(): void {
  localStorage.removeItem(KEY)
}
