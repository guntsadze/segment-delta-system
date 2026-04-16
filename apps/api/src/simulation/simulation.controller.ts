import { Controller, Post, Body } from '@nestjs/common';
import { SimulationService } from './simulation.service';

@Controller('simulation')
export class SimulationController {
  constructor(private simulationService: SimulationService) {}

  @Post('transaction')
  async addTransaction(@Body() body: { customerId: string; amount: number }) {
    return this.simulationService.addTransaction(body.customerId, body.amount);
  }

  @Post('advance-time')
  async advanceTime(@Body() body: { days: number; customerId?: string }) {
    return this.simulationService.advanceTime(body.days, body.customerId);
  }
}
