import { Controller, Get, Param, Query } from '@nestjs/common';
import { DeltaService } from './delta.service';
import { PaginationDto } from 'src/common/dto/pagination.dto';

@Controller('deltas')
export class DeltaController {
  constructor(private readonly deltaService: DeltaService) {}

  @Get('all/deltas')
  async getAllDeltas(@Query() pagination: PaginationDto) {
    return await this.deltaService.getAllDeltas(pagination);
  }

  @Get(':id/deltas')
  async getDeltas(@Param('id') id: string, @Query() pagination: PaginationDto) {
    return this.deltaService.getDeltas(id, pagination);
  }
}
