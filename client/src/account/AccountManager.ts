import { IAccountProvider, AuthResult, UserData } from './IAccountProvider';
import { LocalProvider } from './LocalProvider';
import { RemoteProvider } from './RemoteProvider';

export enum StorageType {
  LOCAL = 'local',
  REMOTE = 'remote'
}

export interface AccountConfig {
  storageType: StorageType;
  apiUrl?: string;
}

export class AccountManager {
  private static instance: AccountManager;
  private provider: IAccountProvider;
  private isAuthenticated: boolean = false;

  private constructor(config: AccountConfig) {
    if (config.storageType === StorageType.LOCAL) {
      this.provider = new LocalProvider();
    } else {
      this.provider = new RemoteProvider(config.apiUrl);
    }
  }

  public static getInstance(config?: AccountConfig): AccountManager {
    if (!AccountManager.instance) {
      if (!config) {
        config = { storageType: StorageType.LOCAL };
      }
      AccountManager.instance = new AccountManager(config);
    }
    return AccountManager.instance;
  }

  async authenticate(username: string, password: string): Promise<AuthResult> {
    const result = await this.provider.authenticate(username, password);
    this.isAuthenticated = result.success;
    return result;
  }

  async getUserData(): Promise<UserData> {
    return await this.provider.getUserData();
  }

  async saveUserData(userData: UserData): Promise<boolean> {
    return await this.provider.saveUserData(userData);
  }

  async syncToCloud(): Promise<boolean> {
    return await this.provider.syncToCloud();
  }

  logout(): void {
    this.provider.logout();
    this.isAuthenticated = false;
  }

  getIsAuthenticated(): boolean {
    return this.isAuthenticated;
  }
}