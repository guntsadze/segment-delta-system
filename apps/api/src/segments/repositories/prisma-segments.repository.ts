import { BadRequestException, Injectable } from '@nestjs/common';
import { BaseCrudService } from 'src/common/services/base-crud.service';
import { ISegmentsRepository } from '../interfaces/segments.repository.interface';
import { PrismaService } from 'prisma/prisma.service';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import {
  ConditionType,
  Segment,
  SegmentRules,
} from 'src/evaluator/evaluator.types';
import { SegmentType } from '@prisma/client';

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

  async validateRules(
    targetSegmentId: string,
    rules: SegmentRules,
  ): Promise<void> {
    const dependencyIds = rules.conditions
      .filter((c) => c.type === ConditionType.IN_SEGMENT && c.segmentId)
      .map((c) => c.segmentId as string);

    for (const depId of dependencyIds) {
      if (depId === targetSegmentId) {
        throw new BadRequestException(
          'სეგმენტი ვერ იქნება საკუთარ თავზე დამოკიდებული',
        );
      }

      await this.detectCycle(depId, targetSegmentId, new Set());
    }
  }

  private async detectCycle(
    currentId: string,
    idToFind: string,
    visited: Set<string>,
  ): Promise<void> {
    if (currentId === idToFind) {
      throw new BadRequestException(
        'შეცდომა: წესების შენახვა გამოიწვევს წრიულ დამოკიდებულებას!',
      );
    }

    if (visited.has(currentId)) return;
    visited.add(currentId);

    const segment = await this.getSegmentById(currentId);
    if (!segment || segment.type === SegmentType.STATIC) return;

    const rules = segment.rules as SegmentRules;
    const deps = rules.conditions
      .filter((c) => c.type === ConditionType.IN_SEGMENT && c.segmentId)
      .map((c) => c.segmentId as string);

    for (const depId of deps) {
      await this.detectCycle(depId, idToFind, visited);
    }
  }

  async getSegmentById(id: string): Promise<Segment | null> {
    const segment = await this.prisma.segment.findUnique({
      where: { id },
    });

    if (!segment) {
      return null;
    }

    return segment as Segment;
  }

  async findDependentSegments(id: string) {
    return this.prisma.segment.findMany({
      where: {
        rules: {
          path: ['conditions'],
          array_contains: [{ segmentId: id }],
        },
      },
      select: { id: true, name: true },
    });
  }
}
