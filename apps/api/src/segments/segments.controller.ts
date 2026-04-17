import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  ParseIntPipe,
  Body,
  Delete,
  Patch,
} from '@nestjs/common';
import { SegmentsService } from './segments.service';
import { PrismaService } from 'prisma/prisma.service';
import { CreateSegmentDto } from './dto/segments.dto';
import { UpdateSegmentDto } from './dto/update-segments.dto';

@Controller('segments')
export class SegmentsController {
  constructor(
    private segmentsService: SegmentsService,
    private readonly prisma: PrismaService,
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
      orderBy: { name: 'asc' },
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

  @Post()
  async create(@Body() createSegmentDto: CreateSegmentDto) {
    return this.segmentsService.create(createSegmentDto);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateSegmentDto: UpdateSegmentDto,
  ) {
    return this.segmentsService.update(id, updateSegmentDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.segmentsService.remove(id);
  }

  @Post(':id/add-member')
  async addMember(
    @Param('id') id: string,
    @Body() body: { customerId: string },
  ) {
    return this.segmentsService.addMemberManually(id, body.customerId);
  }
}
