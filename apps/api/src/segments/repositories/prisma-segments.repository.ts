import { Injectable } from '@nestjs/common';
import { BaseCrudService } from 'src/common/services/base-crud.service';
import { ISegmentsRepository } from '../interfaces/segments.repository.interface';
import { PrismaService } from 'prisma/prisma.service';
import { PaginationDto } from 'src/common/dto/pagination.dto';

@Injectable()
export class PrismaSegmentsRepository
  extends BaseCrudService<any>
  implements ISegmentsRepository
{
  protected modelName = 'segment';

  constructor(prisma: PrismaService) {
    super(prisma);
  }

  async findAllSegments(pagination: PaginationDto) {
    return this.findAll(
      {
        include: { _count: { select: { members: true } } },
        orderBy: { createdAt: 'desc' },
      },
      pagination,
    );
  }

  async findSegmentById(id: string) {
    return this.findOne(id, {
      include: { _count: { select: { members: true } } },
    });
  }

  async createSegment(data: any) {
    return this.create(data, { _count: { select: { members: true } } });
  }

  async updateSegment(id: string, data: any) {
    const segment = await this.update(id, data, {
      include: { _count: { select: { members: true } } },
    });

    return {
      ...segment,
      memberCount: segment._count?.members ?? 0,
    };
  }

  async deleteSegmentWithRelations(id: string) {
    return this.transaction(async (tx) => {
      await tx.segmentMembership.deleteMany({ where: { segmentId: id } });
      await tx.segmentDelta.deleteMany({ where: { segmentId: id } });
      return tx.segment.delete({ where: { id } });
    });
  }
}
