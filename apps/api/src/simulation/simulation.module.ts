import { Module } from '@nestjs/common';
import { SimulationService } from './simulation.service';
import { SimulationController } from './simulation.controller';
import { QueueModule } from 'src/queue/queue.module';
import { EvaluationProducer } from 'src/queue/providers/evaluation.producer';
import { DeltaGateway } from 'src/gateway/delta.gateway';
import { PrismaSimulationRepository } from './simulation-repository';

@Module({
  imports: [QueueModule],
  providers: [
    SimulationService,
    {
      provide: 'ISimulationService',
      useClass: SimulationService,
    },
    { provide: 'ISimulationRepository', useClass: PrismaSimulationRepository },
    {
      provide: 'IEvaluationProducer',
      useClass: EvaluationProducer,
    },
    {
      provide: 'INotificationGateway',
      useClass: DeltaGateway,
    },
  ],
  controllers: [SimulationController],
})
export class SimulationModule {}
