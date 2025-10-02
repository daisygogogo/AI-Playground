import {
  IsBoolean,
  IsEmail,
  IsNotEmpty,
  IsString,
  Validate,
  MinLength,
  Matches
} from 'class-validator';

export class RegisterRequest {
  @IsNotEmpty()
  @IsString()
  firstName!: string;

  @IsNotEmpty()
  @IsString()
  lastName!: string;

  @IsEmail()
  email!: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(4)
  // @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[\dA-Za-z]{4,}$/u, {
  //   message: 'Password is too weak',
  // })
  password!: string;


  @IsBoolean()
  // @Validate((value: boolean) => value === true, {
  //   message: 'You must accept the terms and conditions'
  // })
  terms!: boolean;
}
