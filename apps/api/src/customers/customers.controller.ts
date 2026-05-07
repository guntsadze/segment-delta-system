import { Controller, Get, Param, Query } from '@nestjs/common';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { CustomersService } from './customers.service';

@Controller('customers')
export class CustomersController {
  constructor(private readonly customer: CustomersService) {}

  @Get()
  async getCustomers(@Query() pagination: PaginationDto) {
    return this.customer.getCustomers(pagination);
  }

  @Get(':id/members')
  async getMembersBySegment(
    @Param('id') id: string,
    @Query() pagination: PaginationDto,
  ) {
    return this.customer.getMembersBySegment(id, pagination);
  }
}
