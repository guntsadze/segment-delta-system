import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { DeltaModule } from './delta/delta.module';
import { EvaluatorModule } from './evaluator/evaluator.module';
import { QueueModule } from './queue/queue.module';
import { GatewayModule } from './gateway/gateway.module';
import { SimulationModule } from './simulation/simulation.module';
import { SegmentsModule } from './segments/segments.module';
import { PrismaModule } from 'prisma/prisma.module';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, ignoreEnvFile: false }),
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        connection: {
          host: configService.get('REDIS_HOST') || 'localhost',
          port: configService.get('REDIS_PORT') || 6379,
        },
      }),
    }),
    PrismaModule,
    EvaluatorModule,
    DeltaModule,
    QueueModule,
    GatewayModule,
    SimulationModule,
    SegmentsModule,
  ],
})
export class AppModule {}
