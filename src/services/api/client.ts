import { ENV_CONFIG } from '../../config/env';

export interface ApiError {
  status: number;
  message: string;
  code?: string;
}

class ApiClient {
  private accessToken: string | null = null;
  private onUnauthorizedCallback: (() => void) | null = null;

  public setAccessToken(token: string | null): void {
    this.accessToken = token;
  }

  public getAccessToken(): string | null {
    return this.accessToken;
  }

  public setUnauthorizedHandler(handler: () => void): void {
    this.onUnauthorizedCallback = handler;
  }

  public isBackendConfigured(): boolean {
    return Boolean(ENV_CONFIG.apiBaseUrl);
  }

  public async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    if (!ENV_CONFIG.apiBaseUrl) {
      throw {
        status: 503,
        message: 'Backend API URL is not configured; application is running in Demo Mode.',
        code: 'DEMO_MODE_ONLY',
      } satisfies ApiError;
    }

    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    const url = `${ENV_CONFIG.apiBaseUrl.replace(/\/$/, '')}${cleanEndpoint}`;
    const headers = new Headers(options.headers);
    headers.set('Content-Type', 'application/json');

    if (this.accessToken) {
      headers.set('Authorization', `Bearer ${this.accessToken}`);
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (response.status === 401) {
      this.onUnauthorizedCallback?.();
      throw {
        status: 401,
        message: 'Session expired or unauthorized. Please sign in again.',
        code: 'UNAUTHORIZED',
      } satisfies ApiError;
    }

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Request failed');
      throw {
        status: response.status,
        message: errorText || `HTTP ${response.status}`,
      } satisfies ApiError;
    }

    return (await response.json()) as T;
  }
}

export const apiClient = new ApiClient();
