import { Injectable } from '@nestjs/common';
import { EvaluationProducer } from '../queue/evaluation.producer';
import { PrismaService } from 'prisma/prisma.service';
import { CreateSegmentDto } from './dto/segments.dto';
import { UpdateSegmentDto } from './dto/update-segments.dto';
import { DeltaGateway } from 'src/gateway/delta.gateway';

@Injectable()
export class SegmentsService {
  constructor(
    private evaluationProducer: EvaluationProducer,
    private readonly prisma: PrismaService,
    private gateway: DeltaGateway,
  ) {}

  /**
   * აბრუნებს ყველა სეგმენტს წევრების რაოდენობასთან ერთად
   */
  async findAll() {
    const segments = await this.prisma.segment.findMany({
      include: {
        _count: {
          select: { members: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // ცოტა უფრო ლამაზი ფორმატი ფრონტენდისთვის
    return segments.map((s) => ({
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
        _count: { select: { members: true } },
      },
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
        orderBy: { joinedAt: 'desc' },
      }),
      this.prisma.segmentMembership.count({ where: { segmentId: id } }),
    ]);

    return {
      data: members.map((m) => m.customer),
      total,
      page,
      lastPage: Math.ceil(total / limit),
    };
  }

  /**
   * სეგმენტის ხელით განახლება (Manual Refresh)
   */
  async refresh(id: string) {
    await this.evaluationProducer.triggerEvaluation(id, 'manual');
    return { message: 'Evaluation triggered' };
  }

  /**
   * ახალი სეგმენტის შექმნა
   */
  async create(data: CreateSegmentDto) {
    const segment = await this.prisma.segment.create({
      data: {
        name: data.name,
        type: data.type,
        rules: data.rules as any,
      },
      include: {
        _count: {
          select: { members: true },
        },
      },
    });

    // შექმნისთანავე გავუშვათ პირველი გადათვლა
    await this.evaluationProducer.triggerEvaluation(
      segment.id,
      'initial_creation',
    );
    return {
      ...segment,
      memberCount: segment._count?.members || 0,
    };
  }

  /**
   * სეგმენტის განახლება
   */
  async update(id: string, data: UpdateSegmentDto) {
    const segment = await this.prisma.segment.update({
      where: { id },
      data: {
        name: data.name,
        type: data.type,
        rules: data.rules as any,
      },
      include: {
        _count: {
          select: { members: true },
        },
      },
    });

    // თუ წესები შეიცვალა, ხელახლა უნდა გადაითვალოს
    if (data.rules) {
      await this.evaluationProducer.triggerEvaluation(id, 'rules_updated');
    }
    return {
      ...segment,
      memberCount: segment._count?.members || 0,
    };
  }

  /**
   * სეგმენტის წაშლა
   */
  async remove(id: string) {
    // ჯერ ვშლით წევრობებს და დელტებს (FK constraint-ების გამო)
    await this.prisma.segmentMembership.deleteMany({
      where: { segmentId: id },
    });
    await this.prisma.segmentDelta.deleteMany({ where: { segmentId: id } });
    return this.prisma.segment.delete({ where: { id } });
  }

  async addMemberManually(segmentId: string, customerId: string) {
    const [customer, segment] = await Promise.all([
      this.prisma.customer.findUnique({
        where: { id: customerId },
        select: { name: true },
      }),
      this.prisma.segment.findUnique({
        where: { id: segmentId },
        select: { name: true },
      }),
    ]);

    const membership = await this.prisma.segmentMembership.upsert({
      where: { segmentId_customerId: { segmentId, customerId } },
      update: {},
      create: { segmentId, customerId },
    });

    await this.prisma.segmentDelta.create({
      data: {
        segmentId,
        added: [customerId],
        removed: [],
        addedCount: 1,
        removedCount: 0,
        triggeredBy: 'manual_addition',
      },
    });

    this.gateway.server.emit('system:log', {
      id: Math.random(),
      message: `➕ ადმინ-პანელი: ${customer?.name} ხელით დაემატა სეგმენტში "${segment?.name}".`,
      type: 'action',
      time: new Date().toLocaleTimeString(),
    });

    return membership;
  }
}
