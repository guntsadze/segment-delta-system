import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ExpressAdapter } from '@bull-board/express';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { BullBoardModule } from '@bull-board/nestjs';
import { EvaluationProducer } from './evaluation.producer';
import { EvaluationProcessor } from './evaluation.processor';
import { DeltaModule } from '../delta/delta.module';

@Module({
  imports: [
    BullModule.registerQueue({
      // ვარეგისტრირებთ რიგს და ვარქმევთ პირობით სახელს
      name: 'segment-evaluation',
    }),

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
  providers: [EvaluationProducer, EvaluationProcessor],
  exports: [EvaluationProducer],
})
export class QueueModule {}
