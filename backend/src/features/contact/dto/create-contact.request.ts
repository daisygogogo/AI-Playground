import { IsString, IsOptional, IsEmail, IsUUID } from 'class-validator';

export class CreateContactRequest {
  @IsString()
  name!: string;
  
  @IsEmail()
  email!: string;
  
  @IsOptional()
  @IsString()
  phone?: string;
  
  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  photo?: string;
} 

export class DeleteContactRequest {
  @IsUUID()
  id!: string;
}