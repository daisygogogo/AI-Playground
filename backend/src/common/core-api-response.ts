import { Code } from './code';
import { HttpStatus } from '@nestjs/common';

export class CoreApiResponse<T> {
  constructor(
    public status: number,
    public code: string,
    public message: string | null,
    public data: T | null
  ) {}

  public static success<T>(data: T, message?: string) {
    return new CoreApiResponse(
      HttpStatus.OK,
      Code.SUCCESS.code,
      message || Code.SUCCESS.message,
      data
    );
  }

  public static error<T>(code: string, message: string, data: T | null = null) {
    return new CoreApiResponse(
      HttpStatus.BAD_REQUEST,
      code || Code.INTERNAL_ERROR.code,
      message || Code.INTERNAL_ERROR.message,
      data
    );
  }
}

export type ResponseWithPage<T> = {
  data: T;
  total: number;
  page: number;
  pageSize: number;
};
