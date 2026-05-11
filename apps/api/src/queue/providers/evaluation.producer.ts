import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { IEvaluationProducer } from '../interfaces/evaluation-producer.interface';

@Injectable()
export class EvaluationProducer implements IEvaluationProducer {
  constructor(
    // ვეუბნებით თუ რომელ რიგში ჩააგდოს დავალება
    @InjectQueue('segment-evaluation')
    private queue: Queue,
  ) {}

  async triggerEvaluation(segmentId: string, triggeredBy: string) {
    // jobId-ის გამოყენებით ვაკეთებთ დედუპლიკაციას (Debounce)
    await this.queue.add(
      'evaluate',
      { segmentId, triggeredBy },
      {
        jobId: `eval-${segmentId}`, // თუ სეგმენტის აიდი მოხვდება წამში 100-ჯერ ანუ შემოვა 100 მოთხოვნა, ჩადგებიან რიგში და გადათვლა არ მოხდება 100-ჯერ არამედ მოხდება 1 -ხელ
        removeOnComplete: true, // როგორც კი დავალება შესრულდება, ის წაიშლება Redis-იდან, რომ მეხსიერება არ გაივსოს.

        // delay: 5000 // საჭიროების შემთხვევაში შეგვიძლია დავაყოვნოთ და შემდეგი 5 წამის განმავლობაში შემოსული ყველა ტრანზაქცია დააიგნორდება თუ  ერთიდაიგივე Job ID ით შემოვა მოთხოვნა
      },
    );
  }
}
