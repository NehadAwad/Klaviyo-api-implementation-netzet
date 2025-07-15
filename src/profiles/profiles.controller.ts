import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { KlaviyoService } from '../klaviyo/klaviyo.service';

@ApiTags('profiles')
@Controller('profiles')
export class ProfilesController {
  constructor(private readonly klaviyo: KlaviyoService) {}

  @Get(':email')
  async getProfile(@Param('email') email: string) {
    return this.klaviyo.getProfileAttributesByEmail(email);
  }

  @Get(':email/metrics')
  async getProfileMetrics(@Param('email') email: string) {
    // const profile = await this.klaviyo.getProfileByEmail(email);
    // console.log('getProfileMetrics------@@@ ', profile.data[0].id);
    // if (!profile) return [];
    // return this.klaviyo.getProfileMetrics(profile.data[0].id.toString());
    return this.klaviyo.getMetricsForProfileEmail(email);
  }
} 