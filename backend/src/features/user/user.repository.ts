import { Injectable } from '@nestjs/common';
import type { User } from '.prisma/client';
import { PrismaService } from 'nestjs-prisma';
import { RegisterRequest } from '../authentication/dto/register.request';

@Injectable()
export class UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createUser(data: {
    registerRequest: RegisterRequest;
    hashedPassword: string;
  }): Promise<Omit<User, 'password'>> {
    return this.prisma.user.create({
      omit: {
        password: true,
      },
      data: {
        ...data.registerRequest,
        password: data.hashedPassword,
        role: 'USER',
      },
    });
  }

  async getUserByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async getUserById(userId: string): Promise<Omit<User, 'password'> | null> {
    return this.prisma.user.findUnique({
      omit: {
        password: true,
      },
      where: {
        id: userId,
      },
    });
  }

  async updateUserById(
    userId: string,
    userData: Partial<Omit<User, 'password'>>,
  ): Promise<Omit<User, 'password'>> {
    return this.prisma.user.update({
      data: userData,
      where: {
        id: userId,
      },
      select: {
        password: false,
        id: true,
        createdAt: true,
        updatedAt: true,
        email: true,
        firstName: true,
        lastName: true,
        terms: true,
        role: true,
        department: true,
        jobTitle: true,
        lastLoginAt: true,
        isActive: true,
      },
    });
  }
}
