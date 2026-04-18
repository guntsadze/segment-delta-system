export type LogType = 'added' | 'removed' | 'mixed' | 'update' | 'action';

/**
 *  დამხმარე ფუნქცია ლოგის ტიპის (ფერის) მოსანიშნად დელტას მიხედვით
 */
export function getLogType(addedCount: number, removedCount: number): LogType {
  if (addedCount > 0 && removedCount === 0) return 'added'; // მწვანე
  if (removedCount > 0 && addedCount === 0) return 'removed'; // წითელი
  if (addedCount > 0 && removedCount > 0) return 'mixed'; // ნარინჯისფერი
  return 'update'; // ლურჯი
}
