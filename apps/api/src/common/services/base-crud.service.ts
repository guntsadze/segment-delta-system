import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { PaginatedResult, PaginationParams } from 'types/pagination.types';

@Injectable()
export abstract class BaseCrudService<T> {
  protected abstract modelName: string;
  protected useSoftDelete: boolean = false;

  constructor(protected readonly prisma: PrismaService) {}

  protected get model() {
    return this.prisma[this.modelName];
  }

  /**
   * Create a new record
   */
  async create(data: any, include?: any): Promise<T> {
    return this.model.create({
      data,
      include,
    });
  }

  /**
   * Find all records with optional filtering and pagination
   */
  async findAll(
    params?: {
      where?: any;
      include?: any;
      select?: any;
      orderBy?: any;
    },
    pagination?: PaginationParams,
  ): Promise<T[] | PaginatedResult<T>> {
    const { where, include, select, orderBy } = params || {};

    const baseWhere = this.useSoftDelete
      ? { deletedAt: null, ...where }
      : where;

    if (pagination) {
      const { page = 1, limit = 10 } = pagination;
      const skip = (page - 1) * limit;

      const [data, total] = await Promise.all([
        this.model.findMany({
          where: baseWhere,
          include,
          select,
          orderBy: orderBy || { createdAt: 'desc' },
          skip,
          take: limit,
        }),
        this.model.count({ where: baseWhere }),
      ]);

      return {
        data,
        meta: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      };
    }

    return this.model.findMany({
      where: baseWhere,
      include,
      select,
      orderBy: orderBy || { createdAt: 'desc' },
    });
  }

  /**
   * Find one record by ID
   */
  async findOne(
    id: string,
    params?: {
      include?: any;
      select?: any;
    },
  ): Promise<T> {
    const { include, select } = params || {};

    const record = this.useSoftDelete
      ? await this.model.findFirst({
          where: { id, deletedAt: null },
          include,
          select,
        })
      : await this.model.findUnique({ where: { id }, include, select });

    if (!record) {
      throw new NotFoundException(`${this.modelName} with ID ${id} not found`);
    }

    return record;
  }

  /**
   * Find one record by custom criteria
   */
  async findOneBy(
    where: any,
    params?: {
      include?: any;
      select?: any;
    },
  ): Promise<T | null> {
    const { include, select } = params || {};

    return this.model.findFirst({
      where,
      include,
      select,
    });
  }

  /**
   * Update a record
   */
  async update(
    id: string,
    data: any,
    params?: {
      include?: any;
      select?: any;
    },
  ): Promise<T> {
    const { include, select } = params || {};

    try {
      return await this.model.update({
        where: { id },
        data,
        include,
        select,
      });
    } catch (error) {
      throw new NotFoundException(`${this.modelName} with ID ${id} not found`);
    }
  }

  /**
   * Update many records
   */
  async updateMany(where: any, data: any): Promise<{ count: number }> {
    return this.model.updateMany({
      where,
      data,
    });
  }

  /**
   * Delete a record (soft delete if field exists)
   */
  async remove(id: string): Promise<T> {
    try {
      // Check if model has 'deletedAt' field for soft delete
      const modelFields = await this.prisma.$queryRaw`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = ${this.modelName.toLowerCase()}
      `;

      const hasDeletedAt = (modelFields as any[]).some(
        (field) => field.column_name === 'deletedAt',
      );

      if (hasDeletedAt) {
        return this.model.update({
          where: { id },
          data: { deletedAt: new Date() },
        });
      }

      return this.model.delete({
        where: { id },
      });
    } catch (error) {
      throw new NotFoundException(`${this.modelName} with ID ${id} not found`);
    }
  }

  /**
   * Execute transaction
   */
  async transaction<R>(fn: (tx: any) => Promise<R>): Promise<R> {
    return this.prisma.$transaction(fn);
  }
}
