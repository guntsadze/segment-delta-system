import { Module } from '@nestjs/common';
import { EvaluatorService } from './evaluator.service';
import { PrismaModule } from 'prisma/prisma.module';
import { EvaluatorRepository } from './repositories/evaluator.repository';

@Module({
  imports: [PrismaModule],
  providers: [
    EvaluatorService,
    {
      provide: 'IEvaluatorRepository',
      useClass: EvaluatorRepository,
    },
  ],
  exports: [EvaluatorService],
})
export class EvaluatorModule {}
