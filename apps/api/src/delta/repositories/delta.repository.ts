import { Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { IDeltaRepository } from '../interfaces/delta-repository.interface';
import { BaseCrudService } from 'src/common/services/base-crud.service';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { CHUNK_SIZE, chunkProcess } from 'src/common/utils/array.util';

@Injectable()
export class DeltaRepository
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
    return this.prisma.$transaction(
      async (tx) => {
        // წავშალოთ ისინი, (ვინც სეგმენტიდან გავიდა)
        await chunkProcess(params.removed, CHUNK_SIZE, (chunk) => {
          return tx.segmentMembership.deleteMany({
            where: { segmentId: params.segmentId, customerId: { in: chunk } },
          });
        });

        // დავამატოთ ახალი წევრები (ვინც სეგმენტში შევიდა)
        await chunkProcess(params.added, CHUNK_SIZE, (chunk) =>
          tx.segmentMembership.createMany({
            data: chunk.map((id) => ({
              segmentId: params.segmentId,
              customerId: id,
            })),
            skipDuplicates: true,
          }),
        );

        // 3. შევქმნათ "ისტორიის ჩანაწერი" (Delta)
        const delta = await tx.segmentDelta.create({
          data: {
            segmentId: params.segmentId,
            addedCount: params.added.length,
            removedCount: params.removed.length,
            triggeredBy: params.triggeredBy,
          },
        });

        // 4. ჩავწეროთ დეტალურად ვინ დაემატა ამ დელტაში
        await chunkProcess(params.added, CHUNK_SIZE, (chunk) =>
          tx.deltaAddition.createMany({
            data: chunk.map((id) => ({ deltaId: delta.id, customerId: id })),
          }),
        );

        // 5. ჩავწეროთ დეტალურად ვინ წაიშალა ამ დელტაში
        await chunkProcess(params.removed, CHUNK_SIZE, (chunk) =>
          tx.deltaRemoval.createMany({
            data: chunk.map((id) => ({ deltaId: delta.id, customerId: id })),
          }),
        );

        // 6. ბოლოს ამოვიღოთ სრული ინფორმაცია დასაბრუნებლად
        return tx.segmentDelta.findUnique({
          where: { id: delta.id },
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
      },
      { timeout: 30000 },
    );
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
