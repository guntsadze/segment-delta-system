import {
  Condition,
  ConditionType,
  CONDITION_DEFAULTS,
} from './evaluator.types';
import { IEvaluatorRepository } from './interfaces/evaluator-repository.interface';

export type ConditionHandler = (
  repo: IEvaluatorRepository,
  c: Condition,
  context: {
    evaluate: (id: string) => Promise<Set<string>>;
  },
) => Promise<string[]>;

export const CONDITION_HANDLERS: Record<ConditionType, ConditionHandler> = {
  [ConditionType.MIN_TRANSACTIONS_IN_DAYS]: (repo, c) =>
    repo.getCustomersByMinTransactions(
      c.days ?? CONDITION_DEFAULTS.DAYS,
      c.minCount ?? CONDITION_DEFAULTS.MIN_COUNT,
    ),

  [ConditionType.MIN_SPEND_IN_DAYS]: (repo, c) =>
    repo.getCustomersByMinSpend(
      c.days ?? CONDITION_DEFAULTS.DAYS,
      c.minAmount ?? CONDITION_DEFAULTS.MIN_AMOUNT,
    ),

  [ConditionType.INACTIVE_AFTER_ACTIVE]: (repo, c) =>
    repo.getInactiveCustomers(c.inactiveDays ?? CONDITION_DEFAULTS.DAYS),

  [ConditionType.IN_SEGMENT]: async (repo, c, context) => {
    if (!c.segmentId) return [];

    const result = await context.evaluate(c.segmentId);
    return Array.from(result);
  },
};
