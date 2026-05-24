const SESSION_KEY = 'helfy-session-id';

export function getOrCreateSessionId(): string {
  const existing = localStorage.getItem(SESSION_KEY);

  if (existing) {
    return existing;
  }

  const sessionId = crypto.randomUUID();
  localStorage.setItem(SESSION_KEY, sessionId);
  return sessionId;
}

export function clearSessionId(): void {
  localStorage.removeItem(SESSION_KEY);
}
