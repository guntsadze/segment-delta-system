import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';
import { DeltaGateway } from '../gateway/delta.gateway';
import { PrismaService } from 'prisma/prisma.service';

@Processor('campaign-notifications')
export class CampaignProcessor extends WorkerHost {
  private readonly logger = new Logger('CampaignSimulator');

  constructor(
    private gateway: DeltaGateway,
    private prisma: PrismaService,
  ) {
    super();
  }

  async process(job: Job<{ customerIds: any[]; segmentId: string }>) {
    const { customerIds, segmentId } = job.data;

    const segment = await this.prisma.segment.findUnique({
      where: { id: segmentId },
    });

    for (const item of customerIds) {
      const actualId = typeof item === 'string' ? item : item.id;

      const customer = await this.prisma.customer.findUnique({
        where: { id: actualId },
      });

      if (!customer) continue;

      const message = `[CAMPAIGN] 💌 ვუგზავნით შეთავაზებას: ${customer.name} → გახდა ${segment?.name}-ს წევრი!`;

      this.logger.log(message);

      this.gateway.server.emit('campaign:log', {
        id: Math.random(),
        message,
        time: new Date().toLocaleTimeString(),
      });

      await new Promise((res) => setTimeout(res, 800));
    }
  }
}
