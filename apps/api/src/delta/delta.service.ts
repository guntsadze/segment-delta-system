import { Injectable, Logger, Inject } from '@nestjs/common';
import {
  formatDeltaMessage,
  getLogType,
  wrapAsLogs,
} from 'src/common/utils/log-helper';
import type {
  IDeltaRepository,
  IEvaluator,
} from './interfaces/delta-repository.interface';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { CustomerRepository } from 'src/customers/repositories/customer.repository';
import { IDeltaService } from './interfaces/delta-service.interface';

@Injectable()
export class DeltaService implements IDeltaService {
  private readonly logger = new Logger(DeltaService.name);

  constructor(
    @Inject('IEvaluator') private readonly evaluator: IEvaluator,
    @Inject('IDeltaRepository') private readonly repo: IDeltaRepository,
    @Inject('ICustomerRepository')
    private readonly customerRepo: CustomerRepository,
  ) {}

  /**
   * ითვლის სხვაობას და ანახლებს სეგმენტის წევრებს
   */
  async computeDelta(segmentId: string, triggeredBy: string) {
    // 1. ამოვიღოთ არსებული წევრები ბაზიდან
    const existingMemberIds = await this.customerRepo.getMemberIds(segmentId);
    const previousSet = new Set(existingMemberIds);

    // 2. გამოვთვალოთ ვინ უნდა იყოს სეგმენტში ახლანდელი მონაცემებით
    const currentMemberIds = await this.evaluator.evaluate(segmentId);
    const currentSet = new Set(currentMemberIds);

    // 3. ვიპოვოთ სხვაობა (Delta)
    const added = [...currentMemberIds].filter((id) => !previousSet.has(id));
    const removed = existingMemberIds.filter((id) => !currentSet.has(id));

    if (added.length === 0 && removed.length === 0) return null;

    this.logger.log(
      `Segment ${segmentId} delta: +${added.length}, -${removed.length}`,
    );

    // ბაზის განახლება ტრანზაქციაში
    const delta = await this.repo.updateSegment({
      segmentId,
      added,
      removed,
      triggeredBy,
    });

    return {
      ...this.mapToLog(delta),
      updates: {
        add: delta.additions.map((a) => ({ ...a.customer, id: a.customerId })),
        remove: delta.removals.map((r) => r.customerId),
        total: currentSet.size,
      },
    };
  }

  /**
   * კონკრეტული სეგმენტის ისტორია
   */
  async getDeltas(id: string, pagination: PaginationDto) {
    const deltas = await this.repo.getDeltasBySegment(id, pagination);
    return wrapAsLogs(deltas, (d) => this.mapToLog(d));
  }

  /**
   * ყველა სეგმენტის ისტორია
   */
  async getAllDeltas(pagination: PaginationDto) {
    const deltas = await this.repo.getAllDeltas(pagination);
    return wrapAsLogs(deltas, (d) => this.mapToLog(d));
  }

  /**
   * დამხმარე მეთოდი: გარდაქმნის DB ჩანაწერს UI ლოგად
   */
  private mapToLog(delta: any): any {
    const addedNames =
      delta.additions?.map((a: any) => a.customer.name).join(', ') || '';
    const removedNames =
      delta.removals?.map((r: any) => r.customer.name).join(', ') || '';
    const addedEmails = delta.additions
      ?.map((a: any) => a.customer.email)
      .join(', ');
    const removedEmails = delta.removals
      ?.map((r: any) => r.customer.email)
      .join(', ');

    return {
      id: delta.id,
      time: new Date(delta.computedAt).toLocaleTimeString(),
      timestamp: delta.computedAt,
      type: getLogType(delta.addedCount, delta.removedCount),
      message: formatDeltaMessage(
        addedNames,
        removedNames,
        delta.segment?.name,
      ),
      addedEmails: addedEmails,
      removedEmails: removedEmails,
      triggeredBy: delta.triggeredBy,
      addedCount: delta.addedCount,
      removedCount: delta.removedCount,
    };
  }
}
