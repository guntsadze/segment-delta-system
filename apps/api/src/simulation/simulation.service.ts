import { Injectable, Logger } from '@nestjs/common';
import { EvaluationProducer } from '../queue/evaluation.producer';
import { PrismaService } from 'prisma/prisma.service';

@Injectable()
export class SimulationService {
  private readonly logger = new Logger(SimulationService.name);

  constructor(
    private evaluationProducer: EvaluationProducer,
    private readonly prisma: PrismaService,
  ) {}

  /**
   * სიმულაცია: ახალი ტრანზაქცია
   */
  async addTransaction(customerId: string, amount: number) {
    const transaction = await this.prisma.transaction.create({
      data: { customerId, amount },
    });

    // განვაახლოთ მომხმარებლის ჯამური დახარჯვა და ბოლო ტრანზაქციის დრო
    await this.prisma.customer.update({
      where: { id: customerId },
      data: {
        totalSpent: { increment: amount },
        lastTransactionAt: new Date(),
      },
    });

    // ტრანზაქციის შემდეგ ყველა დინამიური სეგმენტი უნდა გადამოწმდეს
    await this.triggerAllDynamicSegments('simulation:transaction');

    return transaction;
  }

  /**
   * სიმულაცია: დროის გადაწევა (ძალიან მნიშვნელოვანია ტესტირებისთვის!)
   */
  async advanceTime(days: number, customerId?: string) {
    this.logger.log(
      `Advancing time by ${days} days for ${customerId || 'all users'}...`,
    );

    // 1. ტრანზაქციების განახლება
    const transactionQuery = customerId
      ? `UPDATE "Transaction" SET "createdAt" = "createdAt" - INTERVAL '${days} days' WHERE "customerId" = '${customerId}'`
      : `UPDATE "Transaction" SET "createdAt" = "createdAt" - INTERVAL '${days} days'`;

    // 2. მომხმარებლის ბოლო აქტივობის განახლება
    const customerQuery = customerId
      ? `UPDATE "Customer" SET "lastTransactionAt" = "lastTransactionAt" - INTERVAL '${days} days' WHERE "id" = '${customerId}'`
      : `UPDATE "Customer" SET "lastTransactionAt" = "lastTransactionAt" - INTERVAL '${days} days'`;

    await this.prisma.$executeRawUnsafe(transactionQuery);
    await this.prisma.$executeRawUnsafe(customerQuery);

    // 3. ტრიგერი
    await this.triggerAllDynamicSegments(
      customerId
        ? `simulation:time_travel:${customerId}`
        : 'simulation:time_travel',
    );

    return { message: `Time advanced by ${days} days` };
  }
  /**
   * დამხმარე მეთოდი: ყველა დინამიური სეგმენტის რიგში ჩაგდება
   */
  private async triggerAllDynamicSegments(reason: string) {
    const segments = await this.prisma.segment.findMany({
      where: { type: 'DYNAMIC' },
      select: { id: true },
    });

    for (const segment of segments) {
      await this.evaluationProducer.triggerEvaluation(segment.id, reason);
    }
  }
  /**
   * სიმულაცია: მომხმარებლის მონაცემების განახლება
   */
  async updateCustomer(customerId: string, data: any) {
    const updated = await this.prisma.customer.update({
      where: { id: customerId },
      data: {
        ...data,
        lastTransactionAt: new Date(),
      },
    });

    await this.triggerAllDynamicSegments('simulation:customer_update');
    return updated;
  }

  /**
   * სიმულაცია: 50K იმპორტი (Stress Test + Chunking)
   */
  async bulkImport(count: number) {
    this.logger.log(`Starting bulk import of ${count} customers...`);

    const CHUNK_SIZE = 100;
    const totalChunks = Math.ceil(count / CHUNK_SIZE);

    for (let i = 0; i < totalChunks; i++) {
      // 1. შევქმნათ 100 იუზერი მეხსიერებაში
      const batch = Array.from({ length: CHUNK_SIZE }).map((_, j) => ({
        name: `Bulk User ${i * CHUNK_SIZE + j}`,
        email: `bulk_${i}_${j}_${Date.now()}@example.com`,
        totalSpent: Math.random() * 1000,
      }));

      // 2. ჩავწეროთ ბაზაში
      await this.prisma.customer.createMany({ data: batch });

      // 3. რიგში დავალებას ვაგდებთ მხოლოდ პორციის ბოლოს
      // ეს უზრუნველყოფს, რომ სისტემა არ "დაიხრჩოს" 50,000 ცალკეული დავალებით
      await this.triggerAllDynamicSegments(`simulation:bulk_import_chunk_${i}`);

      // მცირე შესვენება (Backpressure), რომ ბაზას ამოუნთქვის საშუალება მივცეთ
      await new Promise((resolve) => setTimeout(resolve, 50));
    }

    return { message: `Bulk import of ${count} customers completed.` };
  }
}
