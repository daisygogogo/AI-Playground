import { Module } from '@nestjs/common';
import { ContactService } from './contact.service';
import { ContactController } from './contact.controller';
import { AppConfigModule } from '../app-config/app-config.module';
import { ContactRepository } from './contact.repository';
import { JwtService } from '@nestjs/jwt';

@Module({
  imports: [AppConfigModule],
  providers: [JwtService, ContactService, ContactRepository],
  controllers: [ContactController],
})
export class ContactModule {} 