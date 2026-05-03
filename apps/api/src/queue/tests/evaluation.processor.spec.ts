import { Test, TestingModule } from '@nestjs/testing';
import { EvaluationProcessor } from '../processors/evaluation.processor';
import { DeltaService } from '../../delta/delta.service';
import { EvaluationProducer } from '../providers/evaluation.producer';
import { DeltaGateway } from 'src/gateway/delta.gateway';
import { PrismaService } from 'prisma/prisma.service';
import { getQueueToken } from '@nestjs/bullmq';
import { Job } from 'bullmq';

describe('EvaluationProcessor', () => {
  let processor: EvaluationProcessor;
  let deltaService: DeltaService;
  let prisma: PrismaService;
  let producer: EvaluationProducer;
  let gateway: DeltaGateway;
  let campaignQueue: any;

  // მოკი მონაცემები
  const mockSegmentId = 'segment-123';
  const mockJob = {
    data: { segmentId: mockSegmentId, triggeredBy: 'test-user' },
  } as Job;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EvaluationProcessor,
        {
          provide: DeltaService,
          useValue: { computeDelta: jest.fn() },
        },
        {
          provide: EvaluationProducer,
          useValue: { triggerEvaluation: jest.fn() },
        },
        {
          provide: DeltaGateway,
          useValue: {
            server: { emit: jest.fn(), to: jest.fn().mockReturnThis() },
            sendDeltaUpdate: jest.fn(),
          },
        },
        {
          provide: PrismaService,
          useValue: {
            segment: { findUnique: jest.fn(), findMany: jest.fn() },
            customer: { findMany: jest.fn() },
          },
        },
        {
          provide: getQueueToken('campaign-notifications'),
          useValue: { add: jest.fn() },
        },
      ],
    }).compile();

    processor = module.get<EvaluationProcessor>(EvaluationProcessor);
    deltaService = module.get<DeltaService>(DeltaService);
    prisma = module.get<PrismaService>(PrismaService);
    producer = module.get<EvaluationProducer>(EvaluationProducer);
    gateway = module.get<DeltaGateway>(DeltaGateway);
    campaignQueue = module.get(getQueueToken('campaign-notifications'));
  });

  it('უნდა დაამუშაოს სეგმენტი და მოახდინოს რეაგირება ცვლილებებზე', async () => {
    // 1. მოვაწყოთ DeltaService-ის პასუხი
    const mockDeltaResult = {
      added: [{ id: 'u1' }],
      removed: ['u2'],
    };
    (deltaService.computeDelta as jest.Mock).mockResolvedValue(mockDeltaResult);

    // 2. მოვაწყოთ Prisma-ს პასუხები
    (prisma.segment.findUnique as jest.Mock).mockResolvedValue({
      name: 'Test Segment',
    });
    (prisma.customer.findMany as jest.Mock)
      .mockResolvedValueOnce([{ id: 'u1', name: 'User One' }]) // addedUsers
      .mockResolvedValueOnce([{ id: 'u2', name: 'User Two' }]); // removedUsers

    (prisma.segment.findMany as jest.Mock).mockResolvedValue([{ id: 'dep-1' }]); // დამოკიდებული სეგმენტები

    // 3. გავუშვათ პროცესი
    const result = await processor.process(mockJob);

    // Assertions (შემოწმებები)
    expect(deltaService.computeDelta).toHaveBeenCalledWith(
      mockSegmentId,
      'test-user',
    );
    expect(gateway.server.emit).toHaveBeenCalledWith(
      'system:log',
      expect.any(Object),
    );
    expect(campaignQueue.add).toHaveBeenCalled(); // შემოწმება ნოტიფიკაციის რიგზე
    expect(producer.triggerEvaluation).toHaveBeenCalledWith(
      'dep-1',
      `cascade:${mockSegmentId}`,
    );
    expect(result).toEqual(mockDeltaResult);
  });

  it('არაფერი არ უნდა გააკეთოს თუ result არის null', async () => {
    (deltaService.computeDelta as jest.Mock).mockResolvedValue(null);

    await processor.process(mockJob);

    expect(prisma.segment.findUnique).not.toHaveBeenCalled();
    expect(gateway.server.emit).not.toHaveBeenCalled();
  });
});
