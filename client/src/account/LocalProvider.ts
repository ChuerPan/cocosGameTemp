import { IAccountProvider, AuthResult, UserData } from './IAccountProvider';
import * as fs from 'fs';
import * as path from 'path';

export class LocalProvider implements IAccountProvider {
  private userDataPath: string;
  private currentUserData: UserData | null = null;
  private token: string | null = null;

  constructor() {
    this.userDataPath = path.join(process.cwd(), 'userdata.json');
    this.loadUserData();
  }

  async authenticate(username: string, password: string): Promise<AuthResult> {
    // 本地模式下简化认证，实际项目中可添加加密验证
    this.token = this.generateMockToken(username);
    
    if (!this.currentUserData) {
      this.currentUserData = {
        userId: 'local_' + Date.now(),
        username: username,
        inventory: []
      };
      await this.saveUserData(this.currentUserData);
    }

    return {
      success: true,
      token: this.token,
      userData: this.currentUserData
    };
  }

  async getUserData(): Promise<UserData> {
    if (!this.currentUserData) {
      throw new Error('No user data available');
    }
    return this.currentUserData;
  }

  async saveUserData(userData: UserData): Promise<boolean> {
    try {
      this.currentUserData = userData;
      fs.writeFileSync(this.userDataPath, JSON.stringify(userData, null, 2));
      return true;
    } catch (error) {
      console.error('Failed to save user data:', error);
      return false;
    }
  }

  async syncToCloud(): Promise<boolean> {
    // 本地模式下的同步逻辑，实际项目中可实现与远程服务器的同步
    console.log('Syncing data to cloud (mock)');
    return true;
  }

  logout(): void {
    this.token = null;
    this.currentUserData = null;
  }

  private loadUserData(): void {
    try {
      if (fs.existsSync(this.userDataPath)) {
        const data = fs.readFileSync(this.userDataPath, 'utf8');
        this.currentUserData = JSON.parse(data);
      }
    } catch (error) {
      console.error('Failed to load user data:', error);
    }
  }

  private generateMockToken(username: string): string {
    // 模拟 JWT 结构
    const header = { alg: 'HS256', typ: 'JWT' };
    const payload = {
      sub: username,
      iat: Date.now(),
      exp: Date.now() + 3600000
    };
    const encodedHeader = Buffer.from(JSON.stringify(header)).toString('base64');
    const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64');
    // 简化的签名，实际项目中应使用真实的签名算法
    const signature = 'mock_signature';
    return `${encodedHeader}.${encodedPayload}.${signature}`;
  }
}