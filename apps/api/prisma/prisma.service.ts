import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private pool: Pool;

  constructor() {
    // 1. ვქმნით Postgres Pool-ს
    const connectionString = process.env.DATABASE_URL;
    const pool = new Pool({ connectionString });
    
    // 2. ვქმნით ადაპტერს
    const adapter = new PrismaPg(pool);

    // 3. გადავცემთ ადაპტერს მშობელ კლასს (PrismaClient)
    super({ adapter });
    
    this.pool = pool;
  }

  async onModuleInit() {
    // კავშირის შემოწმება
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
    await this.pool.end();
  }
}