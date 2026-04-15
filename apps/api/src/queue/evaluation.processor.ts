import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { DeltaService } from '../delta/delta.service';
import { EvaluationProducer } from './evaluation.producer';
import { DeltaGateway } from 'src/gateway/delta.gateway';
import { PrismaService } from 'prisma/prisma.service';

@Processor('segment-evaluation')
export class EvaluationProcessor extends WorkerHost {

  constructor(
    private deltaService: DeltaService,
    private producer: EvaluationProducer,
    private gateway: DeltaGateway,
    private readonly prisma: PrismaService
  ) {
    super();
  }

  async process(job: Job<{ segmentId: string; triggeredBy: string }>) {
    const { segmentId, triggeredBy } = job.data;

    // 1. გამოვთვალოთ დელტა
    const result = await this.deltaService.computeDelta(segmentId, triggeredBy);

    // 2. თუ ცვლილება მოხდა, შევამოწმოთ სხვა სეგმენტები (CASCADE)
    if (result) {
        this.gateway.sendDeltaUpdate(segmentId, result);
      // ვეძებთ სეგმენტებს, რომელთა წესებშიც წერია ჩვენი segmentId
      const dependentSegments = await this.prisma.segment.findMany({
        where: {
          rules: {
            path: ['conditions'],
            array_contains: [{ type: 'IN_SEGMENT', segmentId: segmentId }],
          },
        },
      });

      for (const dep of dependentSegments) {
        await this.producer.triggerEvaluation(dep.id, `cascade:${segmentId}`);
      }
      
      // აქ მოგვიანებით დავამატებთ Socket.IO ემიტს
      console.log(`✅ Processed ${segmentId}. Cascade triggered for ${dependentSegments.length} segments.`);
    }

    return result;
  }
}