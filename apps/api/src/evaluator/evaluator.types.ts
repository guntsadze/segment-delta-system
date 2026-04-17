export enum ConditionType {
  MIN_TRANSACTIONS_IN_DAYS = 'MIN_TRANSACTIONS_IN_DAYS',
  MIN_SPEND_IN_DAYS = 'MIN_SPEND_IN_DAYS',
  INACTIVE_AFTER_ACTIVE = 'INACTIVE_AFTER_ACTIVE',
  ALL_CUSTOMERS = 'ALL_CUSTOMERS',
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
}
