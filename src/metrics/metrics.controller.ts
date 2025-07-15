import { BadRequestException, Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { KlaviyoService } from '../klaviyo/klaviyo.service';

@ApiTags('metrics')
@Controller('metrics')
export class MetricsController {
  constructor(private readonly klaviyo: KlaviyoService) {}

  @Get()
  async getAll() {
    return this.klaviyo.getMetrics();
  }

  /**
   * 4) Count of events for *every* metric on a given date
   * GET /metrics/count?date=2025-07-15
   */
  @Get('count')
  async getCount(@Query('date') date: string) {
    if (!date) throw new BadRequestException('`date` query parameter is required');
    return this.klaviyo.getEventsCountByDate(date);
  }

  // /**
  //  * 5) Unique emails for one metric on a given date
  //  * GET /metrics/emails?metric=purchased&date=2025-07-15
  //  */
  @Get('emails')
  async getEmails(
    @Query('metric') metricName: string,
    @Query('date') date: string,
  ) {
    if (!metricName) throw new BadRequestException('`metric` query parameter is required');
    if (!date)       throw new BadRequestException('`date` query parameter is required');
    return this.klaviyo.getEmailsByMetricName(metricName, date);
  }

} 