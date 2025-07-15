import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { KlaviyoService } from './klaviyo.service';

@Module({
  imports: [HttpModule],
  providers: [KlaviyoService],
  exports: [KlaviyoService],
})
export class KlaviyoModule {} 