import { Segment as PrismaSegment } from '@prisma/client';

export enum ConditionType {
  MIN_TRANSACTIONS_IN_DAYS = 'MIN_TRANSACTIONS_IN_DAYS',
  MIN_SPEND_IN_DAYS = 'MIN_SPEND_IN_DAYS',
  INACTIVE_AFTER_ACTIVE = 'INACTIVE_AFTER_ACTIVE',
  IN_SEGMENT = 'IN_SEGMENT',
}
export interface Condition {
  type: ConditionType;
  days?: number;
  minCount?: number;
  minAmount?: number;
  inactiveDays?: number;
  segmentId?: string;
}

export enum LogicalOperator {
  AND = 'AND',
  OR = 'OR',
}

export interface SegmentRules {
  operator: LogicalOperator;
  conditions: Condition[];
  [key: string]: any;
}

export const CONDITION_DEFAULTS = {
  DAYS: 30,
  MIN_COUNT: 1,
  MIN_AMOUNT: 0,
  INACTIVEDAYS: 30,
  SEGMENTID: '',
};

export type Segment = Omit<PrismaSegment, 'rules'> & {
  rules: SegmentRules;
};
