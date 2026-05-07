import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Delete,
  Patch,
} from '@nestjs/common';
import { SegmentsService } from './segments.service';
import { CreateSegmentDto } from './dto/segments.dto';
import { UpdateSegmentDto } from './dto/update-segments.dto';

@Controller('segments')
export class SegmentsController {
  constructor(private segmentsService: SegmentsService) {}

  @Get()
  async findAll() {
    return this.segmentsService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.segmentsService.findOne(id);
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
