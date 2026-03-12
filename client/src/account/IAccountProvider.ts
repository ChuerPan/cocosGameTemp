export interface UserData {
  userId: string;
  username: string;
  inventory: InventoryItem[];
  [key: string]: any;
}

export interface InventoryItem {
  itemId: string;
  quantity: number;
}

export interface AuthResult {
  success: boolean;
  token?: string;
  userData?: UserData;
  error?: string;
}

export interface IAccountProvider {
  authenticate(username: string, password: string): Promise<AuthResult>;
  getUserData(): Promise<UserData>;
  saveUserData(userData: UserData): Promise<boolean>;
  syncToCloud(): Promise<boolean>;
  logout(): void;
}