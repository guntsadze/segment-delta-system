import { Controller, Get, Param } from '@nestjs/common';
import { DeltaService } from './delta.service';

@Controller('deltas')
export class DeltaController {
  constructor(private readonly deltaService: DeltaService) {}

  @Get('all/deltas')
  async getAllDeltas() {
    return await this.deltaService.getAllDeltas();
  }

  @Get(':id/deltas')
  async getDeltas(@Param('id') id: string) {
    return this.deltaService.getDeltas(id);
  }
}
