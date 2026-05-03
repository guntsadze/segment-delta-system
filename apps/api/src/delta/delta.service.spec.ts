import { Test, TestingModule } from '@nestjs/testing';
import { DeltaService } from './delta.service';

describe('DeltaService', () => {
  let service: DeltaService;

  // Mock ობიექტები
  const mockEvaluator = {
    evaluate: jest.fn(),
  };

  const mockRepo = {
    getMembers: jest.fn(),
    getCustomersByIds: jest.fn(),
    updateSegment: jest.fn(),
    getDeltasBySegment: jest.fn(),
    getAllDeltas: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeltaService,
        { provide: 'IEvaluator', useValue: mockEvaluator },
        { provide: 'IDeltaRepository', useValue: mockRepo },
      ],
    }).compile();

    service = module.get<DeltaService>(DeltaService);
    jest.clearAllMocks(); // ყოველი ტესტის წინ ვასუფთავებთ ისტორიას
  });

  describe('computeDelta', () => {
    it('როცა წევრების რაოდენობა ზუსტად იგივეა', async () => {
      const segmentId = 'seg-empty';
      const members = ['user-1', 'user-2'];

      mockRepo.getMembers.mockResolvedValue(members);
      mockEvaluator.evaluate.mockResolvedValue(new Set(members));

      console.log(`--- ტესტის დასაწყისი: ${segmentId} ---`);
      console.log(`არსებული წევრები: ${members}`);
      console.log(`ახალი სია: ${members}`);

      const result = await service.computeDelta(segmentId, 'system');

      if (result === null) {
        console.log('✅ შედეგი: სხვაობა არ მოიძებნა. ბაზა არ განახლდა.');
      }

      expect(result).toBeNull();
    });

    it('როცა სხვაობა ნაპოვნია', async () => {
      const segmentId = 'seg-101';

      mockRepo.getMembers.mockResolvedValue(['გიორგი', 'ნინო']);
      mockEvaluator.evaluate.mockResolvedValue(new Set(['ნინო', 'დათო']));

      // 1. მომხმარებლების მოკი
      mockRepo.getCustomersByIds.mockImplementation(async (ids: string[]) => {
        return ids.map((id) => ({
          id,
          email: `${id}@test.com`,
          name: `${id}-name`,
        }));
      });

      // 2. რეპოზიტორიამ უნდა დააბრუნოს "შენახული" ჩანაწერის ID
      mockRepo.updateSegment.mockResolvedValue({ id: 'delta-123' });

      console.log(`--- დელტას ძიება სეგმენტისთვის: ${segmentId} ---`);

      const result = await service.computeDelta(segmentId, 'admin');

      if (result) {
        console.log('➕ დაემატა:', result.added.map((u) => u.id).join(', '));
        console.log('➖ წაიშალა:', result.removed.map((u) => u.id).join(', '));
      }

      expect(result?.deltaId).toBe('delta-123');
    });
  });

  describe('getAllDeltas', () => {
    it('უნდა დააბრუნოს ფორმატირებული ისტორია ქართული შეტყობინებით', async () => {
      // 1. მოცემულობა: ერთი ჩანაწერი ისტორიაში
      mockRepo.getAllDeltas.mockResolvedValue([
        {
          id: 'd-1',
          segment: { name: 'VIP' },
          added: ['u1'],
          removed: ['u2'],
          addedCount: 1,
          removedCount: 1,
          computedAt: new Date(),
        },
      ]);

      // სახელების ჰიდრატაცია
      mockRepo.getCustomersByIds.mockImplementation(async (ids: string[]) => {
        if (ids.includes('u1')) return [{ id: 'u1', name: 'გიორგი' }];
        if (ids.includes('u2')) return [{ id: 'u2', name: 'ნიკა' }];
        return [];
      });

      // 2. შესრულება
      const result = await service.getAllDeltas();

      // 3. შემოწმება
      expect(result[0]).toMatchObject({
        id: 'd-1',
        message: expect.stringContaining(
          'სეგმენტი "VIP" განახლდა. დაემატა: გიორგი; გავიდა: ნიკა;',
        ),
      });
    });
  });

  describe('getDeltas (კონკრეტული სეგმენტისთვის)', () => {
    it('უნდა დააბრუნოს კონკრეტული სეგმენტის დელტები', async () => {
      mockRepo.getDeltasBySegment.mockResolvedValue([
        {
          id: 'd-2',
          added: [],
          removed: [],
          addedCount: 0,
          removedCount: 0,
          computedAt: new Date(),
          triggeredBy: 'cron',
        },
      ]);
      mockRepo.getCustomersByIds.mockResolvedValue([]);

      const result = await service.getDeltas('seg-1');

      expect(result).toHaveLength(1);
      expect(result[0].triggeredBy).toBe('cron');
      expect(mockRepo.getDeltasBySegment).toHaveBeenCalledWith('seg-1', 20);
    });
  });
});
