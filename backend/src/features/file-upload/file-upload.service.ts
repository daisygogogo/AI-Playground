import { Injectable, Logger } from '@nestjs/common';
import { CoreApiResponse } from '../../common/core-api-response';
import { Request } from 'express';
import { getFullUrl } from './file-upload.utils';

export interface FileUploadResponse {
  path: string;
  filename: string;
  originalName: string;
  mimetype: string;
  size: number;
}

@Injectable()
export class FileUploadService {
  private readonly logger = new Logger('FileUploadService');

  async processUploadedFile(file: Express.Multer.File, req: Request): Promise<FileUploadResponse> {
    if (!file) {
      throw new Error('No file uploaded');
    }

    this.logger.log(`[ProcessUploadedFile]: Processing file "${file.originalname}" with size ${file.size} bytes`);


    const response: FileUploadResponse = {
      path: getFullUrl(req, file.path),
      filename: file.filename,
      originalName: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
    };
    return response;
  }
}
