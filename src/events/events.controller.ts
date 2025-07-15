import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CreateBulkEventsDto } from './dto/create-bulk-events.dto';
import { CreateEventDto } from './dto/create-event.dto';
import { EventsService } from './events.service';

@ApiTags('events')
@Controller('events')
export class EventsController {
  constructor(private readonly service: EventsService) {}

  @Post()
  async create(@Body() dto: CreateEventDto) {
    return this.service.create(dto);
  }

  @Post('bulk')
  async bulk(@Body() dto: CreateBulkEventsDto) {
    await this.service.createBulk(dto.events);
    return { status: 'ok' };
  }
} 