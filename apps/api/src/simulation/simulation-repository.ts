import { Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { ISimulationRepository } from './interfaces/simulation-repository.interface';

@Injectable()
export class PrismaSimulationRepository implements ISimulationRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createTransaction(customerId: string, amount: number) {
    return this.prisma.transaction.create({
      data: { customerId, amount },
    });
  }

  async createManyTransactions(
    transactions: { customerId: string; amount: number }[],
  ) {
    return this.prisma.transaction.createMany({
      data: transactions,
    });
  }

  async updateCustomerTotalSpent(customerId: string, totalIncrement: number) {
    await this.prisma.customer.update({
      where: { id: customerId },
      data: {
        totalSpent: { increment: totalIncrement },
        lastTransactionAt: new Date(),
      },
    });
  }

  async getCustomerById(customerId: string) {
    return this.prisma.customer.findUnique({ where: { id: customerId } });
  }

  async advanceTimeRaw(days: number, customerId?: string) {
    const transactionQuery = customerId
      ? `UPDATE "Transaction" SET "createdAt" = "createdAt" - INTERVAL '${days} days' WHERE "customerId" = '${customerId}'`
      : `UPDATE "Transaction" SET "createdAt" = "createdAt" - INTERVAL '${days} days'`;

    const customerQuery = customerId
      ? `UPDATE "Customer" SET "lastTransactionAt" = "lastTransactionAt" - INTERVAL '${days} days' WHERE "id" = '${customerId}'`
      : `UPDATE "Customer" SET "lastTransactionAt" = "lastTransactionAt" - INTERVAL '${days} days'`;

    await this.prisma.$executeRawUnsafe(transactionQuery);
    await this.prisma.$executeRawUnsafe(customerQuery);
  }

  async findDynamicSegmentIds() {
    return this.prisma.segment.findMany({
      where: { type: 'DYNAMIC' },
      select: { id: true },
    });
  }

  async updateCustomerData(customerId: string, data: any) {
    return this.prisma.customer.update({
      where: { id: customerId },
      data: { ...data, lastTransactionAt: new Date() },
    });
  }

  async bulkCreateCustomers(data: any[]) {
    await this.prisma.customer.createMany({ data });
  }

  async upsertMembership(segmentId: string, customerId: string) {
    return this.prisma.segmentMembership.upsert({
      where: { segmentId_customerId: { segmentId, customerId } },
      update: {},
      create: { segmentId, customerId },
    });
  }

  async createManualDelta(segmentId: string, customerId: string) {
    await this.prisma.segmentDelta.create({
      data: {
        segmentId,
        additions: { create: { customerId } },
        addedCount: 1,
        removedCount: 0,
        triggeredBy: 'manual_addition',
      },
    });
  }

  async getSegmentAndCustomerNames(segmentId: string, customerId: string) {
    return Promise.all([
      this.prisma.customer.findUnique({
        where: { id: customerId },
        select: { name: true },
      }),
      this.prisma.segment.findUnique({
        where: { id: segmentId },
        select: { name: true },
      }),
    ]);
  }
}
