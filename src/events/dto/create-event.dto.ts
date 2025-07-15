import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsObject, IsString, IsOptional } from 'class-validator';

export class CreateEventDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  eventName: string;

  @ApiProperty({ type: Object, required: false })
  @IsObject()
  @IsOptional()
  eventAttributes?: Record<string, any>;

  @ApiProperty({ type: Object, required: false })
  @IsObject()
  @IsOptional()
  profileAttributes?: Record<string, any>;
} 