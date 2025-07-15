import { Module } from '@nestjs/common';
import { MetricsController } from './metrics.controller';
import { KlaviyoModule } from '../klaviyo/klaviyo.module';

@Module({
  imports: [KlaviyoModule],
  controllers: [MetricsController],
})
export class MetricsModule {} 