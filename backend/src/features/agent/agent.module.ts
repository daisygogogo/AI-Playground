import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { AppConfigModule } from '../app-config/app-config.module';
import { AgentController } from './agent.controller';
import { DatabaseAgentService } from './database-agent.service';

@Module({
  imports: [
    JwtModule,
    ConfigModule,
    AppConfigModule
  ],
  controllers: [AgentController],
  providers: [DatabaseAgentService],
  exports: [DatabaseAgentService],
})
export class AgentModule {}