import { singleton, inject } from 'tsyringe';
import { Config } from '../config';

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

@singleton()
export class Logger {
  private readonly levels: Record<LogLevel, number> = {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3
  };

  constructor(
    @inject(Config) private config: Config
  ) {}

  debug(message: string, meta?: Record<string, unknown>): void {
    this.log('debug', message, meta);
  }

  info(message: string, meta?: Record<string, unknown>): void {
    this.log('info', message, meta);
  }

  warn(message: string, meta?: Record<string, unknown>): void {
    this.log('warn', message, meta);
  }

  error(message: string, error?: Error, meta?: Record<string, unknown>): void {
    this.log('error', message, { ...meta, error: error?.stack });
  }

  private log(level: LogLevel, message: string, meta?: Record<string, unknown>): void {
    const configLevel = this.config.app.logLevel;

    if (this.levels[level] < this.levels[configLevel]) {
      return;
    }

    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level: level.toUpperCase(),
      message,
      ...meta
    };

    const output = JSON.stringify(logEntry);

    switch (level) {
      case 'error':
        console.error(output);
        break;
      case 'warn':
        console.warn(output);
        break;
      default:
        console.log(output);
    }
  }
}
