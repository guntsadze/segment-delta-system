import { Module } from '@nestjs/common';
import { DeltaService } from './delta.service';
import { EvaluatorModule } from 'src/evaluator/evaluator.module';
import { DeltaController } from './delta.controller';

@Module({
  imports: [EvaluatorModule],
  providers: [DeltaService],
  controllers: [DeltaController],
  exports: [DeltaService],
})
export class DeltaModule {}
