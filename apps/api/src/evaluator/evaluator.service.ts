import { Inject, Injectable } from '@nestjs/common';
import { Condition, SegmentRules } from './evaluator.types';
import { IEvaluator } from 'src/delta/interfaces/delta-repository.interface';
import type { IEvaluatorRepository } from './interfaces/evaluator-repository.interface';
import { CONDITION_HANDLERS } from './evaluator.handlers';
import { applyOperator } from './evaluator.utils';
import { SegmentType } from '@prisma/client';

@Injectable()
export class EvaluatorService implements IEvaluator {
  constructor(
    @Inject('IEvaluatorRepository')
    private readonly repo: IEvaluatorRepository,
  ) {}

  /**
   * მთავარი მეთოდი: ითვლის სეგმენტის წევრებს
   */
  async evaluate(segmentId: string): Promise<Set<string>> {
    // სეგმენტის წამოღება ბაზიდან
    const segment = await this.repo.getSegmentById(segmentId);

    if (!segment) throw new Error('სეგმენტი არ მოიძებნა');

    // თუ სეგმენტი სტატიკურია ნიშნავს რომ მომხმარებლები აქ ხელით არიან ჩამატებულნი და უბრალოდ ვაბრუნებთ მის არსებულ წევრებს
    if (segment.type === SegmentType.STATIC) {
      const members = await this.repo.getStaticMembers(segmentId);
      return new Set(members);
    }

    // ვიღებთ სეგმენტის წესებს
    const rules = segment.rules as SegmentRules;

    // თითოეული პირობისთვის ცალ-ცალკე ვიღებთ მომხმარებლების ID-ებს
    const conditionResults = await Promise.all(
      rules.conditions.map((condition) => this.resolveCondition(condition)),
    );

    return applyOperator(rules.operator, conditionResults);
  }

  /**
   * გადათარგმნის თითოეულ პირობას SQL-ში
   */
  private async resolveCondition(condition: Condition): Promise<Set<string>> {
    const handler = CONDITION_HANDLERS[condition.type];

    if (!handler) {
      throw new Error(
        `ასეთი პირობის ტიპი ---> "${condition.type}" <--- არ არსებობს!`,
      );
    }

    const ids = await handler(this.repo, condition, {
      evaluate: this.evaluate.bind(this),
    });
    return new Set(ids);
  }
}
