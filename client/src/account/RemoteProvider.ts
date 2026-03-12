import { IAccountProvider, AuthResult, UserData } from './IAccountProvider';

export class RemoteProvider implements IAccountProvider {
  private baseUrl: string;
  private token: string | null = null;
  private currentUserData: UserData | null = null;

  constructor(baseUrl: string = 'https://api.example.com') {
    this.baseUrl = baseUrl;
  }

  async authenticate(username: string, password: string): Promise<AuthResult> {
    try {
      // 模拟网络请求
      const response = await this.fetchWithRetry(`${this.baseUrl}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
      });

      const data = await response.json();
      
      if (data.success) {
        this.token = data.token;
        this.currentUserData = data.userData;
        return {
          success: true,
          token: data.token,
          userData: data.userData
        };
      } else {
        return {
          success: false,
          error: data.error || 'Authentication failed'
        };
      }
    } catch (error) {
      console.error('Authentication error:', error);
      return {
        success: false,
        error: 'Network error'
      };
    }
  }

  async getUserData(): Promise<UserData> {
    if (!this.token) {
      throw new Error('Not authenticated');
    }

    try {
      const response = await this.fetchWithRetry(`${this.baseUrl}/user/data`, {
        headers: {
          'Authorization': `Bearer ${this.token}`
        }
      });

      const data = await response.json();
      this.currentUserData = data;
      return data;
    } catch (error) {
      console.error('Get user data error:', error);
      throw new Error('Failed to get user data');
    }
  }

  async saveUserData(userData: UserData): Promise<boolean> {
    if (!this.token) {
      return false;
    }

    try {
      const response = await this.fetchWithRetry(`${this.baseUrl}/user/save`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.token}`
        },
        body: JSON.stringify(userData)
      });

      const data = await response.json();
      return data.success;
    } catch (error) {
      console.error('Save user data error:', error);
      return false;
    }
  }

  async syncToCloud(): Promise<boolean> {
    if (!this.token || !this.currentUserData) {
      return false;
    }

    try {
      const response = await this.fetchWithRetry(`${this.baseUrl}/user/sync`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.token}`
        },
        body: JSON.stringify(this.currentUserData)
      });

      const data = await response.json();
      return data.success;
    } catch (error) {
      console.error('Sync to cloud error:', error);
      return false;
    }
  }

  logout(): void {
    this.token = null;
    this.currentUserData = null;
  }

  private async fetchWithRetry(url: string, options: RequestInit, retries: number = 3): Promise<Response> {
    for (let i = 0; i < retries; i++) {
      try {
        const response = await fetch(url, options);
        if (response.ok) {
          return response;
        }
      } catch (error) {
        console.warn(`Request failed, retrying (${i + 1}/${retries})...`);
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
      }
    }
    throw new Error('Max retries exceeded');
  }
}