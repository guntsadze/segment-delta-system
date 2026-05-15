import { Injectable, Logger, Inject } from '@nestjs/common';
import {
  formatDeltaMessage,
  getLogType,
  wrapAsLogs,
} from 'src/common/utils/log-helper';
import type {
  DeltaItemWithCustomer,
  DeltaWithRelations,
  IDeltaRepository,
  IEvaluator,
} from './interfaces/delta-repository.interface';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { CustomerRepository } from 'src/customers/repositories/customer.repository';
import { IDeltaService } from './interfaces/delta-service.interface';
import { ISystemLog } from 'types/log.types';

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
    const currentSet = await this.evaluator.evaluate(segmentId);

    // 3. ვიპოვოთ სხვაობა (Delta)
    const added: string[] = [];
    for (const id of currentSet) {
      if (!previousSet.has(id)) added.push(id);
    }

    const removed: string[] = [];
    for (const id of existingMemberIds) {
      if (!currentSet.has(id)) removed.push(id);
    }

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
  private mapToLog(delta: DeltaWithRelations): ISystemLog {
    const getSampleText = (list: DeltaItemWithCustomer[]) => {
      const count = list.length;
      const samples = list.slice(0, 3).map((item) => item.customer.name);

      return count > 3
        ? `${samples.join(', ')} და კიდევ ${count - 3} სხვა...`
        : samples.join(', ');
    };

    return {
      id: delta.id,
      time: new Date(delta.computedAt).toLocaleTimeString(),
      type: getLogType(delta.addedCount, delta.removedCount),
      message: formatDeltaMessage(
        getSampleText(delta.additions),
        getSampleText(delta.removals),
        delta.segment?.name,
      ),
    };
  }
}
