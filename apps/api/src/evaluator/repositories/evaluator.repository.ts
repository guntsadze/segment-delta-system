import { Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { IEvaluatorRepository } from '../interfaces/evaluator-repository.interface';
import { Segment } from '../evaluator.types';

@Injectable()
export class EvaluatorRepository implements IEvaluatorRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getSegmentById(id: string): Promise<Segment | null> {
    const segment = await this.prisma.segment.findUnique({
      where: { id },
    });

    if (!segment) {
      return null;
    }

    return segment as Segment;
  }

  async getStaticMembers(segmentId: string): Promise<string[]> {
    const members = await this.prisma.segmentMembership.findMany({
      where: { segmentId },
      select: { customerId: true },
    });
    return members.map((m) => m.customerId);
  }

  async getCustomersByMinTransactions(
    days: number,
    minCount: number,
  ): Promise<string[]> {
    const result: { customerId: string }[] = await this.prisma.$queryRaw`
      SELECT "customerId" 
      FROM "Transaction"
      WHERE "createdAt" >= NOW() - CAST(${days} || ' days' AS INTERVAL)
      GROUP BY "customerId"
      HAVING COUNT(*) >= ${minCount}
    `;
    return result.map((r) => r.customerId);
  }

  async getCustomersByMinSpend(
    days: number,
    minAmount: number,
  ): Promise<string[]> {
    const result: { customerId: string }[] = await this.prisma.$queryRaw`
      SELECT "customerId" 
      FROM "Transaction"
      WHERE "createdAt" >= NOW() - CAST(${days} || ' days' AS INTERVAL)
      GROUP BY "customerId"
      HAVING SUM("amount") >= ${minAmount}
    `;
    return result.map((r) => r.customerId);
  }

  async getInactiveCustomers(inactiveDays: number): Promise<string[]> {
    const result: { customerId: string }[] = await this.prisma.$queryRaw`
      SELECT "id" as "customerId" 
      FROM "Customer"
      WHERE "lastTransactionAt" < NOW() - CAST(${inactiveDays} || ' days' AS INTERVAL)
      AND "lastTransactionAt" IS NOT NULL
    `;
    return result.map((r) => r.customerId);
  }

  async getSegmentMembers(segmentId: string): Promise<string[]> {
    const members = await this.prisma.segmentMembership.findMany({
      where: { segmentId },
      select: { customerId: true },
    });
    return members.map((m) => m.customerId);
  }
}
