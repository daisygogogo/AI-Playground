import { BadRequestException, ConflictException, Injectable, Logger } from '@nestjs/common';
import { AppError } from '../../core/enums/app-error.enum';
import { UserRepository } from './user.repository';
import { GetMeResponse } from './dto/get-me.response';
import { UpdateUserResponse } from './dto/update-user.response';
import { UpdateUserRequest } from './dto/update-user.request';

@Injectable()
export class UserService {
  private readonly logger = new Logger('UserService');

  constructor(
    private readonly userRepository: UserRepository,
  ) {}

  async getMe(userId: string): Promise<GetMeResponse> {
    if (!userId) {
      throw new BadRequestException({
        code: AppError.USER_NOT_FOUND,
        message: `User id not found`,
      });
    }
    const user = await this.userRepository.getUserById(userId);
    if (!user) {
      throw new BadRequestException({
        code: AppError.USER_NOT_FOUND,
        message: `User with id ${userId} not found`,
      });
    }
    this.logger.log(`[GetMe]: retrieved user "${user.id}" from the repository`);
    return { user };
  }

  async updateUser(
    userId: string,
    updateUserRequest: UpdateUserRequest,
  ): Promise<UpdateUserResponse> {
    if (!userId) {
      throw new BadRequestException({
        code: AppError.USER_NOT_FOUND,
        message: `User not found`,
      });
    }
    try {
      const userUpdated = await this.userRepository.updateUserById(userId, updateUserRequest);
      this.logger.log(`[UpdateUser]: user updated successfully`);
      return { user: userUpdated };
    } catch {
      throw new BadRequestException({
        code: AppError.UPDATE_USER_FAILED,
        message: `Unable to update user`,
      });
    }
  }
}
