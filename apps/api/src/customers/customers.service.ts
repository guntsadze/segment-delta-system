import { Injectable, Inject } from '@nestjs/common';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { CustomerRepository } from './repositories/customer.repository';

@Injectable()
export class CustomersService {
  constructor(
    @Inject('ICustomerRepository')
    private readonly repo: CustomerRepository,
  ) {}

  async getMembersBySegment(id: string, pagination: PaginationDto) {
    const deltas = await this.repo.getMembersBySegment(id, pagination);
    return deltas;
  }

  async getCustomers(pagination: PaginationDto) {
    const customers = await this.repo.getCustomers(pagination);
    return customers;
  }

  async getMemberIds(segmentId: string) {
    return this.repo.getMemberIds(segmentId);
  }
}
