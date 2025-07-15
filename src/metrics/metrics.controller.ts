import { BadRequestException, Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiQuery, ApiOkResponse, ApiBadRequestResponse, ApiNotFoundResponse } from '@nestjs/swagger';
import { KlaviyoService } from '../klaviyo/klaviyo.service';
import { IsString, IsNotEmpty } from 'class-validator';

export class MetricDateQueryDto {
  @IsString()
  @IsNotEmpty()
  date: string;
}

export class MetricEmailsQueryDto {
  @IsString()
  @IsNotEmpty()
  metric: string;

  @IsString()
  @IsNotEmpty()
  date: string;
}

@ApiTags('metrics')
@Controller('metrics')
export class MetricsController {
  constructor(private readonly klaviyo: KlaviyoService) {}

  @ApiOkResponse({ description: 'All metrics', schema: { example: [{ id: 'metric1', attributes: { name: 'purchased' }, type: 'metric' }] } })
  @Get()
  async getAll() {
    return this.klaviyo.getMetrics();
  }

  @ApiQuery({ name: 'date', required: true, type: String })
  @ApiOkResponse({ description: 'Count of events for every metric on a given date', schema: { example: { date: '2025-07-15', results: [{ id: 'metric1', name: 'purchased', count: 10 }] } } })
  @ApiBadRequestResponse({ description: 'Missing or invalid date', schema: { example: { statusCode: 400, message: ['date should not be empty'], error: 'BadRequestException', timestamp: '2024-06-01T12:34:56.789Z', path: '/metrics/count' } } })
  @Get('count')
  async getCount(@Query() query: MetricDateQueryDto) {
    return this.klaviyo.getEventsCountByDate(query.date);
  }

  @ApiQuery({ name: 'metric', required: true, type: String })
  @ApiQuery({ name: 'date', required: true, type: String })
  @ApiOkResponse({ description: 'Unique emails for one metric on a given date', schema: { example: { metric: 'purchased', date: '2025-07-15', emails: ['user1@example.com', 'user2@example.com'] } } })
  @ApiBadRequestResponse({ description: 'Missing or invalid parameters', schema: { example: { statusCode: 400, message: ['metric should not be empty', 'date should not be empty'], error: 'BadRequestException', timestamp: '2024-06-01T12:34:56.789Z', path: '/metrics/emails' } } })
  @ApiNotFoundResponse({ description: 'Metric not found', schema: { example: { statusCode: 404, message: 'Metric "purchased" not found', error: 'NotFoundException', timestamp: '2024-06-01T12:34:56.789Z', path: '/metrics/emails' } } })
  @Get('emails')
  async getEmails(@Query() query: MetricEmailsQueryDto) {
    return this.klaviyo.getEmailsByMetricName(query.metric, query.date);
  }
} 