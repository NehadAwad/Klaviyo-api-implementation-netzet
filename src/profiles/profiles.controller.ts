import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiQuery, ApiOkResponse, ApiBadRequestResponse, ApiNotFoundResponse } from '@nestjs/swagger';
import { KlaviyoService } from '../klaviyo/klaviyo.service';
import { KlaviyoProfileAttributes, KlaviyoMetric } from '../klaviyo/klaviyo.types';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class EmailQueryDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;
}

@ApiTags('profiles')
@Controller('profiles')
export class ProfilesController {
  constructor(private readonly klaviyo: KlaviyoService) {}

  @ApiQuery({ name: 'email', required: true, type: String })
  @ApiOkResponse({ description: 'Profile attributes.', schema: { example: { email: 'user@example.com', name: 'John Doe', phone: '+1234567890' } } })
  @ApiBadRequestResponse({ description: 'Invalid email format', schema: { example: { statusCode: 400, message: ['email must be an email'], error: 'BadRequestException', timestamp: '2024-06-01T12:34:56.789Z', path: '/profiles' } } })
  @ApiNotFoundResponse({ description: 'Profile not found', schema: { example: { statusCode: 404, message: 'Profile not found', error: 'NotFoundException', timestamp: '2024-06-01T12:34:56.789Z', path: '/profiles' } } })
  @Get()
  async getProfile(@Query() query: EmailQueryDto): Promise<KlaviyoProfileAttributes | null> {
    return this.klaviyo.getProfileAttributesByEmail(query.email);
  }

  @ApiQuery({ name: 'email', required: true, type: String })
  @ApiOkResponse({ description: 'List of metrics for the profile.', schema: { example: [{ id: 'metric1', attributes: { name: 'purchased' }, type: 'metric' }] } })
  @ApiBadRequestResponse({ description: 'Invalid email format', schema: { example: { statusCode: 400, message: ['email must be an email'], error: 'BadRequestException', timestamp: '2024-06-01T12:34:56.789Z', path: '/profiles/metrics' } } })
  @ApiNotFoundResponse({ description: 'Profile not found', schema: { example: { statusCode: 404, message: 'Profile not found', error: 'NotFoundException', timestamp: '2024-06-01T12:34:56.789Z', path: '/profiles/metrics' } } })
  @Get('metrics')
  async getProfileMetrics(@Query() query: EmailQueryDto): Promise<KlaviyoMetric[]> {
    return this.klaviyo.getMetricsForProfileEmail(query.email);
  }
} 