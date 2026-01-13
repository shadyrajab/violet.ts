import { config as dotenvConfig } from 'dotenv';
import { singleton } from 'tsyringe';
import { IConfig } from '../types';

dotenvConfig();

@singleton()
export class Config implements IConfig {
  public readonly discord = {
    token: this.getEnv('TOKEN'),
    clientId: this.getEnv('CLIENT_ID', '')
  };

  public readonly database = {
    host: this.getEnv('DB_HOST', 'localhost'),
    port: parseInt(this.getEnv('DB_PORT', '5432'), 10),
    database: this.getEnv('DB_NAME', 'violet'),
    user: this.getEnv('DB_USER', 'postgres'),
    password: this.getEnv('DB_PASSWORD', '')
  };

  public readonly app = {
    environment: this.getEnv('NODE_ENV', 'development') as 'development' | 'production',
    logLevel: this.getEnv('LOG_LEVEL', 'info') as 'debug' | 'info' | 'warn' | 'error'
  };

  private getEnv(key: string, defaultValue?: string): string {
    const value = process.env[key];
    if (value === undefined && defaultValue === undefined) {
      throw new Error(`Environment variable ${key} is required but not set`);
    }
    return value || defaultValue!;
  }
}
