import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ExpressAdapter } from '@bull-board/express';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { BullBoardModule } from '@bull-board/nestjs';
import { EvaluationProducer } from './providers/evaluation.producer';
import { EvaluationProcessor } from './processors/evaluation.processor';
import { DeltaModule } from '../delta/delta.module';
import { SegmentService } from './segment.service.';
import { DeltaGateway } from 'src/gateway/delta.gateway';
import { CampaignProcessor } from './processors/campaign.processor';

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
      provide: 'ISegmentService',
      useClass: SegmentService,
    },
    {
      provide: 'INotificationGateway',
      useClass: DeltaGateway,
    },
  ],
  exports: [EvaluationProducer],
})
export class QueueModule {}
