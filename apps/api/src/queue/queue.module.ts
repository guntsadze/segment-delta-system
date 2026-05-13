import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ExpressAdapter } from '@bull-board/express';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { BullBoardModule } from '@bull-board/nestjs';
import { EvaluationProducer } from './providers/evaluation.producer';
import { EvaluationProcessor } from './processors/evaluation.processor';
import { DeltaModule } from '../delta/delta.module';
import { QueueService } from './queue.service';
import { DeltaGateway } from 'src/gateway/delta.gateway';
import { CampaignProcessor } from './processors/campaign.processor';
import { DeltaService } from 'src/delta/delta.service';
import { EvaluatorService } from 'src/evaluator/evaluator.service';
import { DeltaRepository } from 'src/delta/repositories/delta.repository';
import { CustomerRepository } from 'src/customers/repositories/customer.repository';

@Module({
  imports: [
    BullModule.registerQueue(
      {
        // ვარეგისტრირებთ რიგს და ვარქმევთ პირობით სახელს
        name: 'segment-evaluation',
      },
      { name: 'campaign-notifications' },
    ),

    // 2. Bull Board-ის მთავარი კონფიგურაცია
    BullBoardModule.forRoot({
      route: '/admin/queues',
      adapter: ExpressAdapter,
    }),

    // 3. კონკრეტული ქიუს დამატება პანელზე
    BullBoardModule.forFeature({
      name: 'segment-evaluation',
      adapter: BullMQAdapter,
    }),

    DeltaModule,
  ],
  providers: [
    EvaluationProducer,
    EvaluationProcessor,
    CampaignProcessor,
    {
      provide: 'IQueueService',
      useClass: QueueService,
    },
    {
      provide: 'INotificationGateway',
      useClass: DeltaGateway,
    },
    {
      provide: 'IEvaluationProducer',
      useClass: EvaluationProducer,
    },
    {
      provide: 'IEvaluator',
      useClass: EvaluatorService,
    },
    {
      provide: 'IDeltaService',
      useClass: DeltaService,
    },
    {
      provide: 'IDeltaRepository',
      useClass: DeltaRepository,
    },
    {
      provide: 'ICustomerRepository',
      useClass: CustomerRepository,
    },
  ],
  exports: [EvaluationProducer, BullModule],
})
export class QueueModule {}
