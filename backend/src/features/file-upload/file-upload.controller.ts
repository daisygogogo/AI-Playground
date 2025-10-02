import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  Request,
  Logger,
  UseGuards,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { FileUploadService, FileUploadResponse } from './file-upload.service';
import { editFileName, imageFileFilter } from './file-upload.utils';
import { CoreApiResponse } from '../../common/core-api-response';
import { AuthenticationGuard } from '../authentication/authentication.guard';
import { Request as ExpressRequest } from 'express';

@Controller('file')
export class FileUploadController {
  private readonly logger = new Logger('FileUploadController');

  constructor(private readonly fileUploadService: FileUploadService) {}

  @Post('upload')
  @UseGuards(AuthenticationGuard)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: 'storage',
        filename: editFileName,
      }),
      limits: {
        fileSize: 1024 * 1024 * 1024, // 1GB limit
      },
      fileFilter: (req, file, cb) => {
        // Allow images, audio, and video files
        if (file.mimetype.startsWith('image/')) {
          return imageFileFilter(req, file, cb);
        }

        return cb(new Error('Only image files are allowed!'), false);
      },
    })
  )
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Request() req: ExpressRequest & { userId: string }
  ): Promise<CoreApiResponse<FileUploadResponse>> {
    const { userId } = req;
    
    if (!file) {
      return CoreApiResponse.error('400', 'No file uploaded');
    }

    this.logger.log(`[UploadFile]: User "${userId}" uploading file "${file.originalname}"`);

    try {
      const result = await this.fileUploadService.processUploadedFile(file, req);
      return CoreApiResponse.success(result, 'File uploaded successfully');
    } catch (error) {
      this.logger.error(`[UploadFile]: Failed to process uploaded file: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return CoreApiResponse.error('500', 'Failed to process uploaded file');
    }
  }
}
