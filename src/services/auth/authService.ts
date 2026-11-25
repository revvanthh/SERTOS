import { ENV_CONFIG } from '../../config/env';
import { AuthSession, LoginHistoryEntry } from '../../types/sertos';
import { apiClient } from '../api/client';
import { formatIstDateTime } from '../../utils/time';

const SESSION_STORAGE_KEY = 'sertos_active_session_v1';
const REMEMBER_KEY = 'sertos_remembered_officer_v1';
const HISTORY_STORAGE_KEY = 'sertos_login_history_v1';

// In-memory session cache so refresh/route checks remain fast and clean
let memorySession: AuthSession | null = null;

export interface LoginPayload {
  identifier: string;
  password: string;
  rememberMe: boolean;
}

export const authService = {
  getRememberedIdentifier(): string {
    try {
      return localStorage.getItem(REMEMBER_KEY) || '';
    } catch {
      return '';
    }
  },

  getLoginHistory(): LoginHistoryEntry[] {
    try {
      const raw = sessionStorage.getItem(HISTORY_STORAGE_KEY);
      if (!raw) return [];
      return JSON.parse(raw) as LoginHistoryEntry[];
    } catch {
      return [];
    }
  },

  recordLoginAttempt(status: 'Success' | 'Failed'): void {
    try {
      const existing = this.getLoginHistory();
      const entry: LoginHistoryEntry = {
        id: `lh-${Date.now()}`,
        timestamp: formatIstDateTime(new Date()),
        mode: ENV_CONFIG.appMode,
        device: navigator.userAgent.includes('Mobile') ? 'Mobile Terminal' : 'Desktop Command Console',
        status,
      };
      const updated = [entry, ...existing].slice(0, 8);
      sessionStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // Ignore storage failures
    }
  },

  getActiveSession(): AuthSession | null {
    if (memorySession) {
      if (new Date(memorySession.expiresAt).getTime() <= Date.now()) {
        this.clearSession();
        return null;
      }
      return memorySession;
    }

    try {
      const raw = sessionStorage.getItem(SESSION_STORAGE_KEY) || localStorage.getItem(SESSION_STORAGE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw) as AuthSession;
      if (new Date(parsed.expiresAt).getTime() <= Date.now()) {
        this.clearSession();
        return null;
      }
      memorySession = parsed;
      apiClient.setAccessToken(parsed.token);
      return parsed;
    } catch {
      return null;
    }
  },

  async login(payload: LoginPayload): Promise<AuthSession> {
    const cleanId = payload.identifier.trim();
    const cleanPassword = payload.password;

    if (!cleanId || !cleanPassword) {
      throw new Error('Officer ID / Email and password are required.');
    }

    // If a real Django backend URL is configured, call its JWT token endpoint;
    // otherwise execute clearly labeled DEMO MODE authentication.
    if (!ENV_CONFIG.isDemoMode) {
      const data = await apiClient.request<{ access: string; officer?: AuthSession['officer'] }>(
        '/api/token/',
        {
          method: 'POST',
          body: JSON.stringify({ username: cleanId, password: cleanPassword }),
        }
      );

      const session: AuthSession = {
        token: data.access,
        mode: 'LIVE',
        officer: data.officer || ENV_CONFIG.defaultDemoOfficer,
        loggedInAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(),
      };
      this.persistSession(session, payload.rememberMe, cleanId);
      this.recordLoginAttempt('Success');
      return session;
    }

    // Simulated latency for realistic command login feel
    await new Promise((resolve) => setTimeout(resolve, 650));

    const { officerId, email, passcode } = ENV_CONFIG.demoCredentials;
    const matchesIdentifier =
      cleanId.toLowerCase() === officerId.toLowerCase() ||
      cleanId.toLowerCase() === email.toLowerCase();

    if (!matchesIdentifier || cleanPassword !== passcode) {
      this.recordLoginAttempt('Failed');
      throw new Error('Invalid Officer ID / Email or password. Use Demo Credentials shown on screen.');
    }

    const demoSession: AuthSession = {
      token: `demo-token-${Date.now()}`,
      mode: 'DEMO',
      officer: { ...ENV_CONFIG.defaultDemoOfficer },
      loggedInAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(),
    };

    this.persistSession(demoSession, payload.rememberMe, cleanId);
    this.recordLoginAttempt('Success');
    return demoSession;
  },

  persistSession(session: AuthSession, rememberMe: boolean, identifier: string): void {
    memorySession = session;
    apiClient.setAccessToken(session.token);
    try {
      sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
      if (rememberMe) {
        localStorage.setItem(REMEMBER_KEY, identifier);
        localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
      } else {
        localStorage.removeItem(REMEMBER_KEY);
        localStorage.removeItem(SESSION_STORAGE_KEY);
      }
    } catch {
      // Ignore storage exceptions
    }
  },

  clearSession(): void {
    memorySession = null;
    apiClient.setAccessToken(null);
    try {
      sessionStorage.removeItem(SESSION_STORAGE_KEY);
      localStorage.removeItem(SESSION_STORAGE_KEY);
    } catch {
      // Ignore storage exceptions
    }
  },
};
