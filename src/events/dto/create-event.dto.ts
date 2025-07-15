import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsObject, IsString, IsOptional } from 'class-validator';
import { EventAttributes, ProfileAttributes } from './event-attributes.interface';

export class CreateEventDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  eventName: string;

  @ApiProperty({ type: Object, required: false })
  @IsObject()
  @IsOptional()
  eventAttributes?: EventAttributes;

  @ApiProperty({ type: Object, required: false })
  @IsObject()
  @IsOptional()
  profileAttributes?: ProfileAttributes;
} 