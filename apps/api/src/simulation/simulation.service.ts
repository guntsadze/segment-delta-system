import { Inject, Injectable, Logger } from '@nestjs/common';
import { ISimulationService } from './interfaces/simulation-service.interface';
import type { ISimulationRepository } from './interfaces/simulation-repository.interface';
import type { IEvaluationProducer } from 'src/queue/interfaces/evaluation-producer.interface';
import type { INotificationGateway } from 'src/queue/interfaces/notification-gateway.interface';
import {
  formatBulkImportMessage,
  formatCustomerUpdateMessage,
  formatManualMembershipMessage,
  formatTimeTravelMessage,
  formatTransactionMessage,
} from 'src/common/utils/log-helper';
import { getNowTime } from 'src/common/utils/date-utils';
import { CHUNK_SIZE, chunkProcess } from 'src/common/utils/array.util';

@Injectable()
export class SimulationService implements ISimulationService {
  private readonly logger = new Logger(SimulationService.name);

  constructor(
    @Inject('IEvaluationProducer')
    private readonly evaluationProducer: IEvaluationProducer,
    @Inject('ISimulationRepository')
    private readonly repo: ISimulationRepository,
    @Inject('INotificationGateway')
    private readonly gateway: INotificationGateway,
  ) {}

  /**
   * სიმულაცია: ახალი ტრანზაქცია
   */
  async addTransaction(customerId: string, amount: number, count: number = 1) {
    // 1. მოვამზადოთ მონაცემები მასივად (Memory-ში)
    const transactionData = Array(count).fill({ customerId, amount });
    const totalIncrement = amount * count;

    // 2. გამოვიყენოთ Bulk Update (დავამატოთ რეპოში ეს მეთოდი)
    const transactions =
      await this.repo.createManyTransactions(transactionData);
    await this.repo.updateCustomerTotalSpent(customerId, totalIncrement);

    const customer = await this.repo.getCustomerById(customerId);
    const message = formatTransactionMessage(customer?.name, amount, count);

    this.gateway.sendSystemLog({
      message,
      time: getNowTime(),
    });

    // ტრანზაქციის შემდეგ ყველა დინამიური სეგმენტი უნდა გადამოწმდეს
    await this.triggerAllDynamicSegments('simulation:transaction');

    return transactions;
  }

  /**
   * სიმულაცია: დროის გადაწევა (ძალიან მნიშვნელოვანია ტესტირებისთვის!)
   */
  async advanceTime(days: number, customerId?: string) {
    let targetName = 'ყველა მომხმარებლისთვის';

    if (customerId) {
      const customer = await this.repo.getCustomerById(customerId);
      targetName = `მომხმარებლისთვის: ${customer?.name}`;
    }

    await this.repo.advanceTimeRaw(days, customerId);

    const message = formatTimeTravelMessage(days, targetName);

    this.gateway.sendSystemLog({
      message: message,
      time: getNowTime(),
    });

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
    const segments = await this.repo.findDynamicSegmentIds();

    await chunkProcess(segments, CHUNK_SIZE, async (chunk) => {
      await Promise.all(
        chunk.map((segment) =>
          this.evaluationProducer.triggerEvaluation(segment.id, reason),
        ),
      );
    });
  }

  /**
   * სიმულაცია: მომხმარებლის მონაცემების განახლება
   */
  async updateCustomer(customerId: string, data: any) {
    const oldCustomer = await this.repo.getCustomerById(customerId);
    const updated = await this.repo.updateCustomerData(customerId, data);

    const message = formatCustomerUpdateMessage(
      oldCustomer?.name,
      updated.name,
    );

    this.gateway.sendSystemLog({
      message: message,
    });

    await this.triggerAllDynamicSegments('simulation:customer_update');
    return updated;
  }

  /**
   * სიმულაცია: 50K იმპორტი (Stress Test + Chunking)
   */
  async bulkImport(count: number) {
    this.logger.log(`Starting bulk import of ${count} customers...`);

    const totalChunks = Math.ceil(count / CHUNK_SIZE);
    let processedChunks = 0;

    const customers = Array.from({ length: count }).map((_, i) => ({
      name: `Bulk User ${i}`,
      email: `bulk_${i}_${Date.now()}@example.com`,
      totalSpent: Math.random() * 1000,
    }));

    await chunkProcess(customers, CHUNK_SIZE, async (chunk) => {
      await this.repo.bulkCreateCustomers(chunk);

      processedChunks++;

      this.gateway.sendSystemLog({
        message: formatBulkImportMessage(processedChunks, totalChunks),
        time: getNowTime(),
      });

      await new Promise((resolve) => setTimeout(resolve, 50));
    });

    await this.triggerAllDynamicSegments('simulation:bulk_import_completed');
    return { message: `Bulk import of ${count} customers completed.` };
  }

  async addMemberManually(segmentId: string, customerId: string) {
    const [customer, segment] = await this.repo.getSegmentAndCustomerNames(
      segmentId,
      customerId,
    );

    const membership = await this.repo.upsertMembership(segmentId, customerId);

    await this.repo.createManualDelta(segmentId, customerId);

    const message = formatManualMembershipMessage(
      customer?.name,
      segment?.name,
    );

    this.gateway.sendSystemLog({
      message: message,
      time: getNowTime(),
    });

    return membership;
  }
}
