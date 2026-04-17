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

  @Post('update-customer')
  async updateCustomer(@Body() body: { customerId: string; data: any }) {
    return this.simulationService.updateCustomer(body.customerId, body.data);
  }

  @Post('bulk-import')
  async bulkImport(@Body() body: { count: number }) {
    return this.simulationService.bulkImport(body.count);
  }
}
