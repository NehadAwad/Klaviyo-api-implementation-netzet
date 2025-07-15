import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ValidateNested, IsArray } from 'class-validator';
import { CreateEventDto } from './create-event.dto';

export class CreateBulkEventsDto {
  @ApiProperty({ type: [CreateEventDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateEventDto)
  events: CreateEventDto[];
} 