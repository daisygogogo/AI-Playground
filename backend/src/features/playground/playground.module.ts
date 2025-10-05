import { Module } from '@nestjs/common';
import { PlaygroundController } from './playground.controller';
import { PlaygroundService } from './playground.service';
import { AuthenticationModule } from '../authentication/authentication.module';
import { AppConfigModule } from '../app-config/app-config.module';

@Module({
  imports: [AuthenticationModule, AppConfigModule],
  controllers: [PlaygroundController],
  providers: [PlaygroundService],
  exports: [PlaygroundService],
})
export class PlaygroundModule {}