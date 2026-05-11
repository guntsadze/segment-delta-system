import { Module } from '@nestjs/common';
import { DeltaService } from './delta.service';
import { EvaluatorModule } from 'src/evaluator/evaluator.module';
import { DeltaController } from './delta.controller';
import { DeltaRepository } from './repositories/delta.repository';
import { EvaluatorService } from 'src/evaluator/evaluator.service';
import { CustomerRepository } from 'src/customers/repositories/customer.repository';

@Module({
  imports: [EvaluatorModule],
  providers: [
    DeltaService,
    {
      provide: 'IDeltaRepository',
      useClass: DeltaRepository,
    },
    {
      provide: 'IEvaluator',
      useClass: EvaluatorService,
    },
    {
      provide: 'ICustomerRepository',
      useClass: CustomerRepository,
    },
  ],
  controllers: [DeltaController],
  exports: [DeltaService],
})
export class DeltaModule {}
