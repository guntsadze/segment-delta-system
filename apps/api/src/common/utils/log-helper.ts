import { LogType, ISystemLog } from 'types/log.types';
import { PaginatedResult } from 'types/pagination.types';

/**
 *  დამხმარე ფუნქცია ლოგის ტიპის (ფერის) მოსანიშნად დელტას მიხედვით
 */
export function getLogType(addedCount: number, removedCount: number): LogType {
  if (addedCount > 0 && removedCount === 0) return 'added'; // მწვანე
  if (removedCount > 0 && addedCount === 0) return 'removed'; // წითელი
  if (addedCount > 0 && removedCount > 0) return 'mixed'; // ნარინჯისფერი
  return 'update'; // ლურჯი
}

/**
 * აწყობს ლოგის ტექსტურ შეტყობინებას
 */
export function formatDeltaMessage(
  addedSummary?: string,
  removedSummary?: string,
  segmentName?: string,
): string {
  let message = segmentName ? `სეგმენტი "${segmentName}" განახლდა.` : '';

  if (addedSummary) {
    message += ` დაემატა: ${addedSummary};`;
  }

  if (removedSummary) {
    message += ` გავიდა: ${removedSummary};`;
  }

  return message;
}

export async function wrapAsLogs<T>(
  result: T[] | PaginatedResult<T>,
  mapper: (item: T) => Promise<ISystemLog>,
): Promise<ISystemLog[] | PaginatedResult<ISystemLog>> {
  // ვამოწმებთ, პასუხი პაგინირებულია თუ პირდაპირ მასივია
  const dataArray = Array.isArray(result) ? result : result.data;

  // მონაცემების ტრანსფორმაცია
  const mappedData = await Promise.all(dataArray.map(mapper));

  // სტრუქტურის შენარჩუნება (თუ პაგინირებული იყო, ისევ პაგინირებულს ვაბრუნებთ)
  if (!Array.isArray(result)) {
    return {
      ...result,
      data: mappedData,
    };
  }

  return mappedData;
}
