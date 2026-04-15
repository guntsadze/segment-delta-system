import { Controller, Get, Post, Param, Query, ParseIntPipe } from '@nestjs/common';
import { SegmentsService } from './segments.service';
import { PrismaService } from 'prisma/prisma.service';

@Controller('segments')
export class SegmentsController {
  constructor(private segmentsService: SegmentsService,
              private readonly prisma: PrismaService
  ) {}

  @Get()
  async findAll() {
    return this.segmentsService.findAll();
  }

  @Get('all/customers')
async getAllCustomers() {
  // უბრალოდ წამოვიღოთ პირველი 50 მომხმარებელი სიმულაციისთვის
  return this.prisma.customer.findMany({
    take: 50,
    orderBy: { name: 'asc' }
  });
}

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.segmentsService.findOne(id);
  }

  @Get(':id/members')
  async getMembers(
    @Param('id') id: string,
    @Query('page', new ParseIntPipe({ optional: true })) page: number = 1,
  ) {
    return this.segmentsService.getMembers(id, page);
  }

  @Get(':id/deltas')
  async getDeltas(@Param('id') id: string) {
    return this.segmentsService.getDeltas(id);
  }

  @Post(':id/refresh')
  async refresh(@Param('id') id: string) {
    return this.segmentsService.refresh(id);
  }
}