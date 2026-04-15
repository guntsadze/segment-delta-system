import { Module } from '@nestjs/common';
import { DeltaService } from './delta.service';
import { EvaluatorModule } from 'src/evaluator/evaluator.module';

@Module({
  imports: [EvaluatorModule],
  providers: [DeltaService],
  exports: [DeltaService],
})
export class DeltaModule {}