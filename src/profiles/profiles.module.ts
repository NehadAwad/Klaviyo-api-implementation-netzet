import { Module } from '@nestjs/common';
import { ProfilesController } from './profiles.controller';
import { KlaviyoModule } from '../klaviyo/klaviyo.module';

@Module({
  imports: [KlaviyoModule],
  controllers: [ProfilesController],
})
export class ProfilesModule {} 