import { PartialType } from '@nestjs/mapped-types';
import { CreateSegmentDto } from './segments.dto';

export class UpdateSegmentDto extends PartialType(CreateSegmentDto) {}
