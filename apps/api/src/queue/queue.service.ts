import { Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { IQueueService } from './interfaces/queue-service.interface';

@Injectable()
export class QueueService implements IQueueService {
  constructor(private prisma: PrismaService) {}

  async findDependentSegments(segmentId: string) {
    return this.prisma.segment.findMany({
      where: {
        rules: {
          // ვიღებთ conditions - ს
          path: ['conditions'],
          // ვიყენებთ array_contains ს რადგან ის იყენებს ინდექსაციას და პირდაპირ პოულობს ზუსტ ჩანაწერს
          array_contains: [{ type: 'IN_SEGMENT', segmentId }],
        },
      },
    });
  }
}
