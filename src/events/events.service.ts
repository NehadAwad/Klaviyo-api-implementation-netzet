import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import { CreateEventDto } from './dto/create-event.dto';
import { EventEntity } from './event.entity';
import { KlaviyoService } from '../klaviyo/klaviyo.service';

@Injectable()
export class EventsService {
  private readonly logger = new Logger(EventsService.name);
  constructor(
    @InjectRepository(EventEntity)
    private readonly repo: Repository<EventEntity>,
    private readonly klaviyo: KlaviyoService,
  ) {}

  async create(dto: CreateEventDto) {
    const saved = this.repo.create({
      eventName: dto.eventName,
      eventAttributes: dto.eventAttributes,
      profileAttributes: dto.profileAttributes,
    });
    await this.repo.save(saved);
    await this.klaviyo.sendEvent(dto);
    return saved;
  }

  async createBulk(dtos: CreateEventDto[]) {
    await Promise.all(dtos.map((d) => this.create(d)));
  }

  /**
   * Purge events older than 7 days. Runs every day at midnight.
   */
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async purgeOld() {
    const cutoff = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    try {
      const result = await this.repo.delete({ createdAt: LessThan(cutoff) });
      this.logger.log(`Purged ${result.affected ?? 0} events older than 7 days.`);
    } catch (error) {
      this.logger.error('Failed to purge old events', error?.message || error);
    }
  }
} 