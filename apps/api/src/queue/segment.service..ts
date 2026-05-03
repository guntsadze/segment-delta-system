import { Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { ISegmentService } from './interfaces/segment-service.interface';

@Injectable()
export class SegmentService implements ISegmentService {
  constructor(private prisma: PrismaService) {}

  async getSegmentById(id: string) {
    return this.prisma.segment.findUnique({
      where: { id },
      select: { name: true },
    });
  }

  async getCustomerNames(ids: string[]) {
    return this.prisma.customer.findMany({
      where: { id: { in: ids } },
      select: { id: true, name: true },
    });
  }

  async getCustomerById(id: string) {
    return this.prisma.customer.findUnique({ where: { id } });
  }

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
