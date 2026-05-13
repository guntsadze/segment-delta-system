import { Injectable } from '@nestjs/common';
import { Condition, SegmentRules } from './evaluator.types';
import { PrismaService } from 'prisma/prisma.service';

@Injectable()
export class EvaluatorService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * მთავარი მეთოდი: ითვლის სეგმენტის წევრებს
   */
  async evaluate(segmentId: string): Promise<Set<string>> {
    // სეგმენტის წამოღება ბაზიდან
    const segment = await this.prisma.segment.findUnique({
      where: { id: segmentId },
    });

    if (!segment) throw new Error('სეგმენტი არ მოიძებნა');

    // თუ სეგმენტი სტატიკურია ნიშნავს რომ მომხმარებლები აქ ხელით არიან ჩამატებულნი და უბრალოდ ვაბრუნებთ მის არსებულ წევრებს
    if (segment.type === 'STATIC') {
      const members = await this.prisma.segmentMembership.findMany({
        where: { segmentId },
        select: { customerId: true },
      });
      return new Set(members.map((m) => m.customerId));
    }

    // ვიღებთ სეგმენტის წესებს
    const rules = segment.rules as unknown as SegmentRules;
    // Set ავტომატურად შლის დუბლიკატებს, სწრაფია ვიდრე მასივში ძებნა
    const conditionResults: Set<string>[] = [];

    // თითოეული პირობისთვის ცალ-ცალკე ვიღებთ მომხმარებლების ID-ებს
    for (const condition of rules.conditions) {
      // ვიღებთ მომხმარებლების ID-ებს
      const ids = await this.resolveCondition(condition);
      conditionResults.push(ids);
    }

    return this.applyOperator(rules.operator, conditionResults);
  }

  /**
   * გადათარგმნის თითოეულ პირობას SQL-ში
   */
  private async resolveCondition(condition: Condition): Promise<Set<string>> {
    let result: { customerId: string }[] = [];

    // ვიყენებთ switch - ს რადგან სხვადასხვა პირობისთვის სხვადასხვა Query გაეშვას ბაზაში

    switch (condition.type) {
      case 'MIN_TRANSACTIONS_IN_DAYS':
        // Transaction ცხრილიდან მოგვაქვს მომხმარებლები ვინც ბოლო X დღეში მინიმუმ N ტრანზაქცია აქვს გატარებული
        result = await this.prisma.$queryRaw`
        SELECT "customerId" 
        FROM "Transaction"
        WHERE "createdAt" >= NOW() - CAST(${condition.days} || ' days' AS INTERVAL)
        GROUP BY "customerId"
        HAVING COUNT(*) >= ${condition.minCount}
      `;
        break;

      case 'MIN_SPEND_IN_DAYS':
        // Transaction ცხრილიდან მოგვაქვს მომხმარებლები, რომლებმაც X დღეში დახარჯეს მინიმუმ N ლარი
        result = await this.prisma.$queryRaw`
        SELECT "customerId" 
        FROM "Transaction"
        WHERE "createdAt" >= NOW() - CAST(${condition.days} || ' days' AS INTERVAL)
        GROUP BY "customerId"
        HAVING SUM("amount") >= ${condition.minAmount}
      `;
        break;

      case 'INACTIVE_AFTER_ACTIVE':
        // პირდაპირ Customer ცხრილში ვნახულობთ lastTransactionAt ველს რადგან ვნახოთ ბოლოს როდის ქონდა აქტივობა
        result = await this.prisma.$queryRaw`
        SELECT "id" as "customerId" 
        FROM "Customer"
        WHERE "lastTransactionAt" < NOW() - CAST(${condition.inactiveDays} || ' days' AS INTERVAL)
        AND "lastTransactionAt" IS NOT NULL
      `;
        break;

      case 'IN_SEGMENT':
        // CASCADE ლოგიკა: ვამოწმებთ სხვა სეგმენტის წევრობას
        const members = await this.prisma.segmentMembership.findMany({
          where: { segmentId: condition.segmentId },
          select: { customerId: true },
        });
        return new Set(members.map((m) => m.customerId));

      // case 'ALL_CUSTOMERS':
      //   result = await this.prisma.$queryRaw`
      //   SELECT "id" AS "customerId" FROM "Customer"
      // `;
      //   break;
    }

    return new Set(result.map((r) => r.customerId));
  }

  /**
   * აერთიანებს შედეგებს AND ან OR ლოგიკით
   */
  private applyOperator(
    operator: 'AND' | 'OR',
    results: Set<string>[],
  ): Set<string> {
    // თუ პირობები საერთოდ არ გვაქვს, სეგმენტი ცარიელია
    if (results.length === 0) return new Set();
    // თუ მხოლოდ ერთი პირობაა,
    // პირდაპირ იმას ვაბრუნებთ (ოპტიმიზაცია)
    if (results.length === 1) return results[0];

    results.sort((a, b) => a.size - b.size);

    if (operator === 'AND') {
      const finalSet = new Set<string>();
      const [smallestSet, ...otherSets] = results;

      // მხოლოდ ყველაზე პატარა სეტის წევრებს ვამოწმებთ სხვებში
      for (const id of smallestSet) {
        if (otherSets.every((s) => s.has(id))) {
          finalSet.add(id);
        }
      }

      return finalSet;
    } else {
      // OR: უბრალოდ ვამატებთ ყველას ერთ სეტში დუბლიკატების გარეშე
      const finalSet = new Set<string>();
      for (const resultSet of results) {
        for (const id of resultSet) {
          finalSet.add(id);
        }
      }
      return finalSet;
    }
  }
}
