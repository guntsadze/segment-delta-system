import { Injectable, Logger, Inject } from '@nestjs/common';
import { getLogType } from 'src/common/utils/log-helper';
import type {
  IDeltaRepository,
  IEvaluator,
} from './interfaces/delta.repository.interface';

@Injectable()
export class DeltaService {
  private readonly logger = new Logger(DeltaService.name);

  constructor(
    @Inject('IEvaluator') private readonly evaluator: IEvaluator,
    @Inject('IDeltaRepository') private readonly repo: IDeltaRepository,
  ) {}

  /**
   * ითვლის სხვაობას და ანახლებს სეგმენტის წევრებს
   */
  async computeDelta(segmentId: string, triggeredBy: string) {
    // 1. ამოვიღოთ არსებული წევრები ბაზიდან
    const existingMemberIds = await this.repo.getMembers(segmentId);
    const previousSet = new Set(existingMemberIds);

    // 2. გამოვთვალოთ ვინ უნდა იყოს სეგმენტში ახლანდელი მონაცემებით
    const currentSet = await this.evaluator.evaluate(segmentId);

    // 3. ვიპოვოთ სხვაობა (Delta)
    const added = [...currentSet].filter((id) => !previousSet.has(id));
    const removed = [...previousSet].filter((id) => !currentSet.has(id));

    if (added.length === 0 && removed.length === 0) return null;

    // ვპოულობთ მომხმარებლების Email-ები დამატებულებისთვის
    const addedCustomers = await this.repo.getCustomersByIds(added);
    const removedCustomers = await this.repo.getCustomersByIds(removed);

    this.logger.log(
      `Segment ${segmentId} delta: +${added.length}, -${removed.length}`,
    );

    // 5. ბაზის განახლება ტრანზაქციაში
    const deltaRecord = await this.repo.updateSegment({
      segmentId,
      added,
      removed,
      triggeredBy,
    });

    return {
      segmentId,
      added: addedCustomers.map((c) => ({ id: c.id, email: c.email })),
      removed: removedCustomers.map((c) => ({ id: c.id, email: c.email })),
      deltaId: deltaRecord.id,
    };
  }

  /**
   *  დამხმარე მეთოდი: ID-ების მიხედვით დამიბრუნებს სახელებს
   */
  private async hydrateNames(addedIds: string[], removedIds: string[]) {
    const [addedUsers, removedUsers] = await Promise.all([
      this.repo.getCustomersByIds(addedIds),
      this.repo.getCustomersByIds(removedIds),
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
    const deltas = await this.repo.getDeltasBySegment(id, 20);

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
    const deltas = await this.repo.getAllDeltas(50);

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
