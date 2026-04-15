// import { Module } from '@nestjs/common';
// import { BullModule } from '@nestjs/bullmq';
// import { EvaluationProducer } from './evaluation.producer';
// import { EvaluationProcessor } from './evaluation.processor';
// import { DeltaModule } from '../delta/delta.module';

// @Module({
//   imports: [
//     BullModule.forRoot({
//       connection: {
//         host: 'localhost',
//         port: 6379,
//       },
//     }),
//     BullModule.registerQueue({
//       name: 'segment-evaluation',
//     }),
//     DeltaModule, // დაგვჭირდება DeltaService-ის გამოსაყენებლად
//   ],
//   providers: [EvaluationProducer, EvaluationProcessor],
//   exports: [EvaluationProducer, BullModule],
// })
// export class QueueModule {}


import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { EvaluationProducer } from './evaluation.producer';
import { EvaluationProcessor } from './evaluation.processor';
import { DeltaModule } from '../delta/delta.module';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'segment-evaluation',
    }),
    DeltaModule,
  ],
  providers: [EvaluationProducer, EvaluationProcessor],
  exports: [EvaluationProducer], // ვაექსპორტებთ პროდიუსერს სხვებისთვის
})
export class QueueModule {}