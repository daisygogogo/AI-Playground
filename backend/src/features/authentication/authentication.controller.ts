import {
  BadRequestException,
  Body,
  Controller,
  Headers,
  HttpCode,
  Logger,
  Post,
  UseInterceptors,
} from '@nestjs/common';
import { LoginRequest } from './dto/login.request';
import { LoginResponse } from './dto/login.response';
import { RegisterRequest } from './dto/register.request';
import { RegisterResponse } from './dto/register.response';
import { RefreshTokenResponse } from './dto/refresh-token.response';
import { AuthenticationService } from './services/authentication.service';
import { AppError } from '../../core/enums/app-error.enum';
import { RefreshTokenRequest } from './dto/refresh-token.request';
import { CoreApiResponse } from '../../common/core-api-response';

@Controller('auth')
export class AuthenticationController {
  private readonly logger = new Logger('UserController');

  constructor(private readonly authenticationService: AuthenticationService) {}

  @Post('register')
  async registerAuth(
    @Body() registerRequest: RegisterRequest,
  ): Promise<CoreApiResponse<RegisterResponse>> {
    registerRequest.email = registerRequest.email.trim().toLowerCase();
    this.logger.log(`[Register]: registering user with email "${registerRequest.email}"`);
    const result = await this.authenticationService.register({ registerRequest });
    return CoreApiResponse.success(result, 'Registration successful');
  }

  @Post('login')
  @HttpCode(200)
  async login(@Body() loginRequest: LoginRequest): Promise<CoreApiResponse<LoginResponse>> {
    this.logger.log(`[Login]: attempting login user with email "${loginRequest.email}"`);
    const result = await this.authenticationService.login(loginRequest);
    return CoreApiResponse.success(result, 'Login successful');
  }

  @Post('token/refresh')
  @HttpCode(200)
  async refreshToken(
    @Body() refreshTokenRequest: RefreshTokenRequest,
  ): Promise<CoreApiResponse<RefreshTokenResponse>> {
    this.logger.log(`[RefreshToken]: refreshing token`);
    const result = await this.authenticationService.refreshToken(refreshTokenRequest);
    return CoreApiResponse.success(result, 'Token refreshed successfully');
  }
}
