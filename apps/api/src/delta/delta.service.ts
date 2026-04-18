import { Injectable, Logger } from '@nestjs/common';
import { EvaluatorService } from '../evaluator/evaluator.service';
import { PrismaService } from 'prisma/prisma.service';
import { getLogType } from 'src/common/utils/log-helper';

@Injectable()
export class DeltaService {
  private readonly logger = new Logger(DeltaService.name);

  constructor(
    private evaluatorService: EvaluatorService,
    private readonly prisma: PrismaService,
  ) {}

  /**
   * ითვლის სხვაობას და ანახლებს სეგმენტის წევრებს
   */
  async computeDelta(segmentId: string, triggeredBy: string) {
    // 1. ამოვიღოთ არსებული წევრები ბაზიდან
    const existingMembers = await this.prisma.segmentMembership.findMany({
      where: { segmentId },
      select: { customerId: true },
    });
    const previousSet = new Set(existingMembers.map((m) => m.customerId));

    // 2. გამოვთვალოთ ვინ უნდა იყოს სეგმენტში ახლანდელი მონაცემებით
    const currentSet = await this.evaluatorService.evaluate(segmentId);

    // 3. ვიპოვოთ სხვაობა (Delta)
    const added = [...currentSet].filter((id) => !previousSet.has(id));
    const removed = [...previousSet].filter((id) => !currentSet.has(id));

    // ვპოულობთ მომხმარებლების Email-ები დამატებულებისთვის
    const addedCustomers = await this.prisma.customer.findMany({
      where: { id: { in: added } },
      select: { id: true, email: true },
    });

    // ვპოულობთ მომხმარებლების Email-ები წაშლილებისთვის
    const removedCustomers = await this.prisma.customer.findMany({
      where: { id: { in: removed } },
      select: { id: true, email: true },
    });
    // 4. თუ არაფერი შეცვლილა, გავჩერდეთ (ოპტიმიზაცია)
    if (added.length === 0 && removed.length === 0) {
      return null;
    }

    this.logger.log(
      `Segment ${segmentId} delta: +${added.length}, -${removed.length}`,
    );

    // 5. ბაზის განახლება ტრანზაქციაში
    return await this.prisma.$transaction(async (tx) => {
      // წავშალოთ ისინი, ვინც სეგმენტიდან გავიდა
      if (removed.length > 0) {
        await tx.segmentMembership.deleteMany({
          where: {
            segmentId,
            customerId: { in: removed },
          },
        });
      }

      // დავამატოთ ახალი წევრები
      if (added.length > 0) {
        await tx.segmentMembership.createMany({
          data: added.map((customerId) => ({
            segmentId,
            customerId,
          })),
          // თავს ვიზღვევთ რომ თუ ვინმე უკვე არის სიაში შეცდომა არ გვქონდეს
          skipDuplicates: true,
        });
      }

      // ჩავწეროთ დელტა ისტორიისთვის
      const delta = await tx.segmentDelta.create({
        data: {
          segmentId,
          added,
          removed,
          addedCount: added.length,
          removedCount: removed.length,
          triggeredBy,
        },
      });

      return {
        segmentId,
        added: addedCustomers,
        removed: removedCustomers,
        deltaId: delta.id,
      };
    });
  }

  /**
   *  დამხმარე მეთოდი: ID-ების მიხედვით დამიბრუნებს სახელებს
   */
  private async hydrateNames(addedIds: string[], removedIds: string[]) {
    const [addedUsers, removedUsers] = await Promise.all([
      this.prisma.customer.findMany({
        where: { id: { in: addedIds } },
        select: { name: true },
      }),
      this.prisma.customer.findMany({
        where: { id: { in: removedIds } },
        select: { name: true },
      }),
    ]);

    return {
      addedSummary: addedUsers.map((u) => u.name).join(', '),
      removedSummary: removedUsers.map((u) => u.name).join(', '),
    };
  }

  /**
   *  კონკრეტული სეგმენტის ისტორია
   */
  async getDeltas(id: string) {
    const deltas = await this.prisma.segmentDelta.findMany({
      where: { segmentId: id },
      take: 20,
      orderBy: { computedAt: 'desc' },
    });

    return Promise.all(
      deltas.map(async (d) => {
        // 🎯 ვიყენებთ დამხმარე ფუნქციას
        const { addedSummary, removedSummary } = await this.hydrateNames(
          d.added,
          d.removed,
        );

        return {
          id: d.id,
          timestamp: new Date(d.computedAt).toLocaleTimeString(),
          addedCount: d.addedCount,
          removedCount: d.removedCount,
          addedSummary,
          removedSummary,
          triggeredBy: d.triggeredBy,
        };
      }),
    );
  }

  /**
   *  ყველა სეგმენტის ისტორია
   */
  async getAllDeltas() {
    const deltas = await this.prisma.segmentDelta.findMany({
      take: 50,
      orderBy: { computedAt: 'desc' },
      include: { segment: { select: { name: true } } },
    });

    return Promise.all(
      deltas.map(async (d) => {
        const { addedSummary, removedSummary } = await this.hydrateNames(
          d.added,
          d.removed,
        );
        const logType = getLogType(d.addedCount, d.removedCount);
        let message = `სეგმენტი "${d.segment.name}" განახლდა.`;
        if (addedSummary) message += ` დაემატა: ${addedSummary};`;
        if (removedSummary) message += ` გავიდა: ${removedSummary};`;

        return {
          id: d.id,
          time: new Date(d.computedAt).toLocaleTimeString(),
          type: logType,
          message: message,
        };
      }),
    );
  }
}
