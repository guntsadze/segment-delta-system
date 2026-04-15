import { Injectable, Logger } from '@nestjs/common';
import { EvaluationProducer } from '../queue/evaluation.producer';
import { PrismaService } from 'prisma/prisma.service';

@Injectable()
export class SimulationService {
  private readonly logger = new Logger(SimulationService.name);

  constructor(private evaluationProducer: EvaluationProducer,
    private readonly prisma: PrismaService
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
  async advanceTime(days: number) {
    this.logger.log(`Advancing time by ${days} days...`);
    
    // სინამდვილეში ჩვენ თარიღებს ვაკლებთ X დღეს
    // ეს უფრო მარტივია, ვიდრე სისტემური დროის შეცვლა
    await this.prisma.$executeRawUnsafe(`
      UPDATE "Transaction" SET "createdAt" = "createdAt" - INTERVAL '${days} days'
    `);
    
    await this.prisma.$executeRawUnsafe(`
      UPDATE "Customer" SET "lastTransactionAt" = "lastTransactionAt" - INTERVAL '${days} days'
    `);

    await this.triggerAllDynamicSegments('simulation:time_travel');
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
}