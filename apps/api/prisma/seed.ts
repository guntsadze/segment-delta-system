import { PrismaClient, SegmentType } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import * as dotenv from 'dotenv';

// 1. .env ფაილის წაკითხვა
dotenv.config();

// 2. კავშირის მომზადება (Adapter Pattern - Prisma 7-ის მოთხოვნა)
const connectionString = `${process.env.DATABASE_URL}`;

if (!connectionString) {
  throw new Error('DATABASE_URL is not defined in your .env file');
}
const pool = new Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: false, // გავთიშე რადგან გამეშვა რენდერის ბაზაზე seed მონაცემები
  },
});
const adapter = new PrismaPg(pool);

// 3. კლიენტის შექმნა ადაპტერით
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Seeding database with Prisma 7 Adapter...');

  // გასუფთავება
  await prisma.segmentMembership.deleteMany();
  await prisma.segmentDelta.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.segment.deleteMany();
  await prisma.customer.deleteMany();

  // 1. მომხმარებლების შექმნა
  const now = new Date();
  for (let i = 1; i <= 60; i++) {
    let lastTxDate = new Date();
    let totalSpent = 0;

    if (i <= 20) {
      lastTxDate.setDate(now.getDate() - (i % 10));
      totalSpent = 100 + i * 5;
    } else if (i <= 35) {
      lastTxDate.setDate(now.getDate() - 20);
      totalSpent = 600 + i * 10;
    } else if (i <= 50) {
      lastTxDate.setDate(now.getDate() - 100);
      totalSpent = 50;
    } else if (i <= 58) {
      lastTxDate.setDate(now.getDate() - 95);
      totalSpent = 800;
    } else {
      lastTxDate.setDate(now.getDate() - 300);
      totalSpent = 0;
    }

    await prisma.customer.create({
      data: {
        name: `Customer ${i}`,
        email: `customer${i}@example.com`,
        totalSpent: totalSpent,
        lastTransactionAt: lastTxDate,
        transactions: {
          create: { amount: totalSpent, createdAt: lastTxDate },
        },
      },
    });
  }

  // 2. სეგმენტები
  const riskGroup = await prisma.segment.create({
    data: {
      name: 'Risk Group',
      type: SegmentType.DYNAMIC,
      rules: {
        operator: 'AND',
        conditions: [{ type: 'INACTIVE_AFTER_ACTIVE', inactiveDays: 90 }],
      },
    },
  });

  const vipCustomers = await prisma.segment.create({
    data: {
      name: 'VIP Customers',
      type: SegmentType.DYNAMIC,
      rules: {
        operator: 'AND',
        conditions: [{ type: 'MIN_SPEND_IN_DAYS', days: 60, minAmount: 500 }],
      },
    },
  });

  await prisma.segment.create({
    data: {
      name: 'Active Buyers',
      type: SegmentType.DYNAMIC,
      rules: {
        operator: 'AND',
        conditions: [
          { type: 'MIN_TRANSACTIONS_IN_DAYS', days: 30, minCount: 1 },
        ],
      },
    },
  });

  await prisma.segment.create({
    data: {
      name: 'VIP at Risk',
      type: SegmentType.DYNAMIC,
      rules: {
        operator: 'AND',
        conditions: [
          { type: 'IN_SEGMENT', segmentId: riskGroup.id },
          { type: 'IN_SEGMENT', segmentId: vipCustomers.id },
        ],
      },
    },
  });

  await prisma.segment.create({
    data: {
      name: 'March Campaign Audience',
      type: SegmentType.STATIC,
      rules: {},
      frozenAt: new Date(),
    },
  });

  console.log('✅ Seeding successful!');
}

main()
  .catch((e) => {
    console.error('❌ Seed Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end(); // აუცილებელია pool-ის დახურვა
  });
