import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags, ApiBody, ApiOkResponse, ApiBadRequestResponse } from '@nestjs/swagger';
import { CreateBulkEventsDto } from './dto/create-bulk-events.dto';
import { CreateEventDto } from './dto/create-event.dto';
import { EventsService } from './events.service';
import { EventEntity } from './event.entity';

@ApiTags('events')
@Controller('events')
export class EventsController {
  constructor(private readonly service: EventsService) {}

  @ApiBody({ type: CreateEventDto })
  @ApiOkResponse({ type: EventEntity, description: 'The created event.' })
  @ApiBadRequestResponse({ description: 'Invalid event data', schema: { example: { statusCode: 400, message: ['eventName should not be empty'], error: 'BadRequestException', timestamp: '2024-06-01T12:34:56.789Z', path: '/events' } } })
  @Post()
  async create(@Body() dto: CreateEventDto) {
    return this.service.create(dto);
  }

  @ApiBody({ type: CreateBulkEventsDto })
  @ApiOkResponse({ schema: { example: { status: 'ok' } }, description: 'Bulk events created.' })
  @ApiBadRequestResponse({ description: 'Invalid bulk event data', schema: { example: { statusCode: 400, message: ['events should not be empty'], error: 'BadRequestException', timestamp: '2024-06-01T12:34:56.789Z', path: '/events/bulk' } } })
  @Post('bulk')
  async bulk(@Body() dto: CreateBulkEventsDto) {
    await this.service.createBulk(dto.events);
    return { status: 'ok' };
  }
} 