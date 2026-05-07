import { Injectable } from '@nestjs/common';
import { BaseCrudService } from 'src/common/services/base-crud.service';
import { ICustomerRepository } from '../interfaces/customer.repository.interface';
import { PrismaService } from 'prisma/prisma.service';
import { PaginationDto } from 'src/common/dto/pagination.dto';

@Injectable()
export class PrismaCustomerRepository
  extends BaseCrudService<any>
  implements ICustomerRepository
{
  protected modelName = 'customer';

  constructor(prisma: PrismaService) {
    super(prisma);
  }

  async getMembersBySegment(id: string, pagination: PaginationDto) {
    return this.findAll(
      {
        where: {
          memberships: {
            some: {
              segmentId: id,
            },
          },
        },
        include: {
          memberships: {
            include: {
              segment: { select: { name: true } },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      },
      pagination,
    );
  }

  async getCustomers(pagination: PaginationDto) {
    return this.findAll({}, pagination);
  }
}
