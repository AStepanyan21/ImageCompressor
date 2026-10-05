const API_BASE_URL = '/api/auth';

interface RegisterRequest {
  username: string;
  password: string;
}

interface LoginRequest {
  username: string;
  password: string;
}

export const AuthService = {
  async register(username: string, password: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password } as RegisterRequest),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Registration failed');
    }
  },

  async login(username: string, password: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password } as LoginRequest),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Login failed');
    }
  },

  async logout(): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/logout`, {
      method: 'POST',
    });

    if (!response.ok) {
      throw new Error('Logout failed');
    }
  },
};
