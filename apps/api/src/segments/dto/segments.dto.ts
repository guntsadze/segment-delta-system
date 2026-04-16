import {
  IsString,
  IsEnum,
  IsNotEmpty,
  IsArray,
  ValidateNested,
  IsOptional,
  IsNumber,
  Min,
  IsIn,
} from 'class-validator';
import { Type } from 'class-transformer';
import { SegmentType } from '@prisma/client';
import { ConditionType, LogicalOperator } from 'src/evaluator/evaluator.types';

/**
 * 1. ცალკეული პირობის ვალიდაცია
 */
export class SegmentConditionDto {
  @IsEnum(ConditionType)
  type!: ConditionType;

  @IsOptional()
  @IsNumber()
  @Min(0)
  days?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  minAmount?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  minCount?: number;

  @IsOptional()
  @IsString()
  segmentId?: string;
}

/**
 * 2. წესების (Rules) ობიექტის ვალიდაცია
 */
export class SegmentRulesDto {
  @IsNotEmpty()
  @IsIn(['AND', 'OR'])
  operator!: LogicalOperator;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SegmentConditionDto)
  conditions!: SegmentConditionDto[];
}

/**
 * 3. მთავარი DTO სეგმენტის შესაქმნელად
 */
export class CreateSegmentDto {
  @IsString()
  @IsNotEmpty({ message: 'სეგმენტის სახელი აუცილებელია' })
  name!: string;

  @IsEnum(SegmentType, { message: 'მიუთითეთ ვალიდური ტიპი: DYNAMIC ან STATIC' })
  type!: SegmentType;

  @ValidateNested()
  @Type(() => SegmentRulesDto)
  rules!: SegmentRulesDto;
}
