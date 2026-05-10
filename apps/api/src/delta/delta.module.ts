import { Module } from '@nestjs/common';
import { DeltaService } from './delta.service';
import { EvaluatorModule } from 'src/evaluator/evaluator.module';
import { DeltaController } from './delta.controller';
import { PrismaDeltaRepository } from './repositories/delta.repository';
import { EvaluatorService } from 'src/evaluator/evaluator.service';
import { PrismaCustomerRepository } from 'src/customers/repositories/prisma-customer.repository';

@Module({
  imports: [EvaluatorModule],
  providers: [
    DeltaService,
    {
      provide: 'IDeltaRepository',
      useClass: PrismaDeltaRepository,
    },
    {
      provide: 'IEvaluator',
      useClass: EvaluatorService,
    },
    {
      provide: 'ICustomerRepository',
      useClass: PrismaCustomerRepository,
    },
  ],
  controllers: [DeltaController],
  exports: [DeltaService],
})
export class DeltaModule {}
