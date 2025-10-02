import { IsOptional, IsString, IsNumber, IsIn, Min, Max } from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class SortByDto {
  @IsString()
  @IsIn(['name', 'email', 'phone', 'createdAt', 'updatedAt'])
  field!: string;

  @IsIn(['asc', 'desc'])
  direction!: 'asc' | 'desc';
}

export class GetContactsRequest {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  pageSize?: number = 10;

  @IsOptional()
  @IsString()
  filtersKeyWord?: string;

  @IsOptional()
  @Transform(({ value }) => {
    // Handle both object format and query string format
    if (typeof value === 'string') {
      try {
        return JSON.parse(value);
      } catch {
        return value;
      }
    }
    // Handle query string format like sortBy[field]=phone&sortBy[direction]=asc
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      const field = value['field'] || value['sortBy[field]'];
      const direction = value['direction'] || value['sortBy[direction]'];
      if (field && direction) {
        return { field, direction };
      }
    }
    return value;
  })
  sortBy?: SortByDto;
}
