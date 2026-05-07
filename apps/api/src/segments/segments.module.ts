import { Module } from '@nestjs/common';
import { SegmentsService } from './segments.service';
import { SegmentsController } from './segments.controller';
import { QueueModule } from 'src/queue/queue.module';
import { PrismaSegmentsRepository } from './repositories/prisma-segments.repository';

@Module({
  imports: [QueueModule],
  providers: [
    SegmentsService,
    {
      provide: 'ISegmentsRepository',
      useClass: PrismaSegmentsRepository,
    },
  ],
  controllers: [SegmentsController],
})
export class SegmentsModule {}
