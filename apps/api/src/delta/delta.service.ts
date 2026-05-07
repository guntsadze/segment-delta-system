import { Injectable, Logger, Inject } from '@nestjs/common';
import {
  formatDeltaMessage,
  getLogType,
  wrapAsLogs,
} from 'src/common/utils/log-helper';
import type {
  IDeltaRepository,
  IEvaluator,
} from './interfaces/delta.repository.interface';
import { PaginationDto } from 'src/common/dto/pagination.dto';

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

    this.logger.log(
      `Segment ${segmentId} delta: +${added.length}, -${removed.length}`,
    );

    // ბაზის განახლება ტრანზაქციაში
    await this.repo.updateSegment({
      segmentId,
      added,
      removed,
      triggeredBy,
    });

    const { addedSummary, removedSummary } = await this.hydrateNames(
      added,
      removed,
    );

    const logType = getLogType(added.length, removed.length);

    const message = formatDeltaMessage(addedSummary, removedSummary);
    return {
      added,
      removed,

      time: new Date().toLocaleTimeString(),
      type: logType,
      message: message,
      segmentId: segmentId,
      addedCount: added.length,
      removedCount: removed.length,
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
  async getDeltas(id: string, pagination: PaginationDto) {
    const deltasBySegment = await this.repo.getDeltasBySegment(id, pagination);

    return wrapAsLogs(deltasBySegment, async (d) => {
      const { addedSummary, removedSummary } = await this.hydrateNames(
        d.added,
        d.removed,
      );
      const logType = getLogType(d.addedCount, d.removedCount);

      const message = formatDeltaMessage(addedSummary, removedSummary);

      return {
        time: new Date(d.computedAt).toLocaleTimeString(),
        id: d.id,
        timestamp: new Date(d.computedAt).toLocaleTimeString(),
        type: logType,
        message: message,
        triggeredBy: d.triggeredBy,
      } as any;
    });
  }

  /**
   *  ყველა სეგმენტის ისტორია
   */
  async getAllDeltas(pagination: PaginationDto) {
    const deltas = await this.repo.getAllDeltas(pagination);

    return wrapAsLogs(deltas, async (d) => {
      console.log('🚀 ~ DeltaService ~ getAllDeltas ~ d:', d);
      const { addedSummary, removedSummary } = await this.hydrateNames(
        d.added,
        d.removed,
      );

      const logType = getLogType(d.addedCount, d.removedCount);

      const message = formatDeltaMessage(
        addedSummary,
        removedSummary,
        d.segment.name,
      );

      return {
        id: d.id,
        time: new Date(d.computedAt).toLocaleTimeString(),
        type: logType,
        message: message,
      };
    });
  }
}
