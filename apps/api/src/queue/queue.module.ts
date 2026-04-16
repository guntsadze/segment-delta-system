import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { EvaluationProducer } from './evaluation.producer';
import { EvaluationProcessor } from './evaluation.processor';
import { DeltaModule } from '../delta/delta.module';

@Module({
  imports: [
    BullModule.registerQueue({
      // ვარეგისტრირებთ რიგს და ვარქმევთ პირობით სახელს
      name: 'segment-evaluation',
    }),
    DeltaModule,
  ],
  providers: [EvaluationProducer, EvaluationProcessor],
  exports: [EvaluationProducer],
})
export class QueueModule {}
