import { Module } from '@nestjs/common';
import { EvaluatorService } from './evaluator.service';
import { PrismaModule } from 'prisma/prisma.module';

@Module({
    imports: [PrismaModule],
  providers: [EvaluatorService],
  exports: [EvaluatorService], 
})
export class EvaluatorModule {}
