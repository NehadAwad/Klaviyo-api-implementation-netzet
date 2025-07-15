import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventEntity } from './event.entity';
import { EventsController } from './events.controller';
import { EventsService } from './events.service';
import { KlaviyoModule } from '../klaviyo/klaviyo.module';

@Module({
  imports: [TypeOrmModule.forFeature([EventEntity]), KlaviyoModule],
  controllers: [EventsController],
  providers: [EventsService],
})
export class EventsModule {} 