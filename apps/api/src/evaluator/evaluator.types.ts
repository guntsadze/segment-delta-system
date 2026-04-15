export type ConditionType = 
  | 'MIN_TRANSACTIONS_IN_DAYS' 
  | 'MIN_SPEND_IN_DAYS' 
  | 'INACTIVE_AFTER_ACTIVE' 
  | 'IN_SEGMENT';

export interface Condition {
  type: ConditionType;
  days?: number;
  minCount?: number;
  minAmount?: number;
  inactiveDays?: number;
  segmentId?: string;
}

export interface SegmentRules {
  operator: 'AND' | 'OR';
  conditions: Condition[];
}