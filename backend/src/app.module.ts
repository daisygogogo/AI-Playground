import { Module } from '@nestjs/common';
import { PrismaModule } from 'nestjs-prisma';
import { UserModule } from './features/user/user.module';
import { HealthModule } from './features/health/health.module';
import { AppConfigModule } from './features/app-config/app-config.module';
import { AuthenticationModule } from './features/authentication/authentication.module';
import { ContactModule } from './features/contact/contact.module';
import { FileUploadModule } from './features/file-upload/file-upload.module';
import { PlaygroundModule } from './features/playground/playground.module';

@Module({
  imports: [
    AppConfigModule,
    PrismaModule.forRoot({
      isGlobal: true,
    }),
    HealthModule,
    AuthenticationModule,
    UserModule,
    ContactModule,
    FileUploadModule,
    PlaygroundModule,
  ],
})
export class AppModule {}
