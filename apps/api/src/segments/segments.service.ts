import { Injectable, Inject, ConflictException } from '@nestjs/common';
import { EvaluationProducer } from '../queue/providers/evaluation.producer';
import type { ISegmentsRepository } from './interfaces/segments.repository.interface';
import { CreateSegmentDto } from './dto/segments.dto';
import { UpdateSegmentDto } from './dto/update-segments.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';

@Injectable()
export class SegmentsService {
  constructor(
    @Inject('ISegmentsRepository')
    private readonly repo: ISegmentsRepository,
    private readonly evaluationProducer: EvaluationProducer,
  ) {}

  async findAll(pagination: PaginationDto) {
    return this.repo.findAllSegments(pagination);
  }

  async findOne(id: string) {
    return this.repo.findSegmentById(id);
  }

  async refresh(id: string) {
    await this.evaluationProducer.triggerEvaluation(id, 'manual');
    return { message: 'Evaluation triggered' };
  }

  async create(data: CreateSegmentDto) {
    const segment = await this.repo.createSegment({
      name: data.name,
      type: data.type,
      rules: data.rules,
    });

    await this.evaluationProducer.triggerEvaluation(
      segment.id,
      'initial_creation',
    );
    return { ...segment, memberCount: segment._count?.members || 0 };
  }

  async update(id: string, data: UpdateSegmentDto) {
    if (data.rules) {
      await this.repo.validateRules(id, data.rules);
    }
    const segment = await this.repo.updateSegment(id, data);

    if (data.rules) {
      await this.evaluationProducer.triggerEvaluation(id, 'rules_updated');
    }
    return { ...segment, memberCount: segment._count?.members || 0 };
  }

  async remove(id: string) {
    const dependents = await this.repo.findDependentSegments(id);

    if (dependents.length > 0) {
      const names = dependents.map((s) => s.name).join(', ');
      throw new ConflictException(
        `სეგმენტის წაშლა შეუძლებელია, რადგან მას იყენებენ შემდეგი სეგმენტები ---> ${names}`,
      );
    }
    return this.repo.deleteSegmentWithRelations(id);
  }
}
