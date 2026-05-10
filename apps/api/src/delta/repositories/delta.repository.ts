import { Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { IDeltaRepository } from '../interfaces/delta.repository.interface';
import { BaseCrudService } from 'src/common/services/base-crud.service';
import { PaginationDto } from 'src/common/dto/pagination.dto';

@Injectable()
export class PrismaDeltaRepository
  extends BaseCrudService<any>
  implements IDeltaRepository
{
  protected modelName = 'segmentDelta';

  constructor(prisma: PrismaService) {
    super(prisma);
  }
  async getMembers(segmentId: string): Promise<string[]> {
    const members = await this.prisma.segmentMembership.findMany({
      where: { segmentId },
      select: { customerId: true },
    });
    return members.map((m) => m.customerId);
  }

  async updateSegment(params: {
    segmentId: string;
    added: string[];
    removed: string[];
    triggeredBy: string;
  }) {
    return this.prisma.$transaction(async (tx) => {
      // წავშალოთ ისინი, ვინც სეგმენტიდან გავიდა
      if (params.removed.length > 0) {
        await tx.segmentMembership.deleteMany({
          where: {
            segmentId: params.segmentId,
            customerId: { in: params.removed },
          },
        });
      }
      // დავამატოთ ახალი წევრები
      if (params.added.length > 0) {
        await tx.segmentMembership.createMany({
          data: params.added.map((id) => ({
            segmentId: params.segmentId,
            customerId: id,
          })),
          // თავს ვიზღვევთ რომ თუ ვინმე უკვე არის სიაში შეცდომა არ გვქონდეს
          skipDuplicates: true,
        });
      }
      // ჩავწეროთ დელტა ისტორიისთვის
      return tx.segmentDelta.create({
        data: {
          segmentId: params.segmentId,
          additions: {
            create: params.added.map((id) => ({ customerId: id })),
          },
          removals: {
            create: params.removed.map((id) => ({ customerId: id })),
          },
          addedCount: params.added.length,
          removedCount: params.removed.length,
          triggeredBy: params.triggeredBy,
        },
        include: {
          segment: { select: { name: true } },
          additions: {
            include: { customer: { select: { name: true, email: true } } },
          },
          removals: {
            include: { customer: { select: { name: true, email: true } } },
          },
        },
      });
    });
  }

  async getDeltasBySegment(segmentId: string, pagination: PaginationDto) {
    return this.findAll(
      {
        where: { segmentId },
        include: {
          segment: { select: { name: true } },
          additions: { include: { customer: { select: { name: true } } } },
          removals: { include: { customer: { select: { name: true } } } },
        },
        orderBy: { computedAt: 'desc' },
      },
      pagination,
    );
  }

  async getAllDeltas(pagination: PaginationDto) {
    return this.findAll(
      {
        include: {
          segment: { select: { name: true } },
          additions: { include: { customer: { select: { name: true } } } },
          removals: { include: { customer: { select: { name: true } } } },
        },
        orderBy: { computedAt: 'desc' },
      },
      pagination,
    );
  }
}
