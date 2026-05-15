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

export function formatTransactionMessage(
  customerName: string,
  amount: number,
  count: number,
): string {
  const base = `💳 ტრანზაქცია: ${customerName}-ზე გატარდა $${amount}`;
  return count > 1 ? `${base} (${count}-ჯერ).` : `${base}.`;
}

export function formatTimeTravelMessage(days: number, target: string): string {
  return `⏳ მომხმარებლის უმოქმედობა: გადავიწიეთ ${days} დღით უკან (${target}).`;
}

export function formatCustomerUpdateMessage(
  oldName: string | undefined,
  newName: string,
): string {
  const nameChanged = oldName && oldName !== newName;

  const nameSection = nameChanged
    ? `(სახელი შეიცვალა: "${oldName}" ➔ "${newName}")`
    : '';

  return `👤 პროფილი: ${newName}-ს მონაცემები განახლდა. ${nameSection}`.trim();
}

export function formatManualMembershipMessage(
  customerName: string | undefined,
  segmentName: string | undefined,
): string {
  const cName = customerName;
  const sName = segmentName;

  return `➕ ადმინ-პანელი: ${cName} ხელით დაემატა სეგმენტში "${sName}".`;
}

export function formatBulkImportMessage(
  current: number,
  total: number,
): string {
  return `📦 იმპორტი: დამუშავდა ${current}-ე პაკეტი (${total}-დან). მომხმარებლები წარმატებით დაემატა.`;
}

export async function wrapAsLogs<T>(
  result: T[] | PaginatedResult<T>,
  mapper: (item: T) => ISystemLog | Promise<ISystemLog>,
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
