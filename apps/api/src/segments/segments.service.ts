import { Injectable } from '@nestjs/common';
import { EvaluationProducer } from '../queue/evaluation.producer';
import { PrismaService } from 'prisma/prisma.service';

@Injectable()
export class SegmentsService {

  constructor(private evaluationProducer: EvaluationProducer,
    private readonly prisma: PrismaService
  ) {}

  /**
   * აბრუნებს ყველა სეგმენტს წევრების რაოდენობასთან ერთად
   */
  async findAll() {
    const segments = await this.prisma.segment.findMany({
      include: {
        _count: {
          select: { members: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // ცოტა უფრო ლამაზი ფორმატი ფრონტენდისთვის
    return segments.map(s => ({
      ...s,
      memberCount: s._count.members,
    }));
  }

  /**
   * სეგმენტის დეტალები
   */
  async findOne(id: string) {
    return this.prisma.segment.findUnique({
      where: { id },
      include: {
        _count: { select: { members: true } }
      }
    });
  }

  /**
   * სეგმენტის წევრების პაგინირებული სია
   */
  async getMembers(id: string, page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;
    
    const [members, total] = await Promise.all([
      this.prisma.segmentMembership.findMany({
        where: { segmentId: id },
        include: { customer: true },
        skip,
        take: limit,
        orderBy: { joinedAt: 'desc' }
      }),
      this.prisma.segmentMembership.count({ where: { segmentId: id } })
    ]);

    return {
      data: members.map(m => m.customer),
      total,
      page,
      lastPage: Math.ceil(total / limit)
    };
  }

  /**
   * ბოლო 20 დელტა ცვლილება ისტორიისთვის
   */
  async getDeltas(id: string) {
    return this.prisma.segmentDelta.findMany({
      where: { segmentId: id },
      take: 20,
      orderBy: { computedAt: 'desc' }
    });
  }

  /**
   * სეგმენტის ხელით განახლება (Manual Refresh)
   */
  async refresh(id: string) {
    await this.evaluationProducer.triggerEvaluation(id, 'manual');
    return { message: 'Evaluation triggered' };
  }
}