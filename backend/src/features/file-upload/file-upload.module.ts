import { Module } from '@nestjs/common';
import { FileUploadController } from './file-upload.controller';
import { FileUploadService } from './file-upload.service';
import { AuthenticationModule } from '../authentication/authentication.module';
import { AppConfigModule } from '../app-config/app-config.module';


@Module({
  imports: [AuthenticationModule, AppConfigModule],
  controllers: [FileUploadController],
  providers: [FileUploadService],
  exports: [FileUploadService],
})
export class FileUploadModule {}
