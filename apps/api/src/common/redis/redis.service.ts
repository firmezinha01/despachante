import { Injectable, OnModuleDestroy, Logger } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private client: Redis | null = null;

  constructor() {
    try {
      const host = process.env.REDIS_HOST || 'localhost';
      const port = Number(process.env.REDIS_PORT) || 6379;
      this.client = new Redis({
        host,
        port,
        maxRetriesPerRequest: 1,
        retryStrategy: () => null, // Evita travar se Redis não estiver conectado em dev
      });

      this.client.on('error', (err) => {
        this.logger.warn(`Redis connection warning: ${err.message}. Operando em modo fallback.`);
      });
    } catch (err: any) {
      this.logger.warn(`Could not initialize Redis: ${err?.message}`);
    }
  }

  getClient(): Redis | null {
    return this.client;
  }

  async get(key: string): Promise<string | null> {
    if (!this.client) return null;
    try {
      return await this.client.get(key);
    } catch {
      return null;
    }
  }

  async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    if (!this.client) return;
    try {
      if (ttlSeconds) {
        await this.client.set(key, value, 'EX', ttlSeconds);
      } else {
        await this.client.set(key, value);
      }
    } catch {}
  }

  async del(key: string): Promise<void> {
    if (!this.client) return;
    try {
      await this.client.del(key);
    } catch {}
  }

  onModuleDestroy() {
    if (this.client) {
      this.client.disconnect();
    }
  }
}
