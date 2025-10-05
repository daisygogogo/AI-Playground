import { Injectable } from '@nestjs/common';
import { PrismaService } from 'nestjs-prisma';
import { GetContactsRequest } from './dto/get-contacts.request';

@Injectable()
export class ContactRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getContactsWithFilters(userId: string, userRole: string, query: GetContactsRequest = {}) {
    const { page = 1, pageSize = 10, filtersKeyWord, sortBy } = query;
    const skip = (page - 1) * pageSize;
    
    // Build where clause for filtering
    const where: any = {};
    
    // Only apply userId filter for non-admin users
    if (userRole !== 'ADMIN') {
      where.userId = userId;
    }

    if (filtersKeyWord) {
      where.OR = [
        {
          name: {
            contains: filtersKeyWord,
            mode: 'insensitive',
          },
        },
        {
          email: {
            contains: filtersKeyWord,
            mode: 'insensitive',
          },
        },
      ];
    }
    
    // Build orderBy clause for sorting
    let orderBy: any = {};
    if (sortBy?.field && sortBy?.direction) {
      orderBy[sortBy.field] = sortBy.direction;
    } else {
      orderBy.createdAt = 'desc'; // Default sorting
    }

    // Get total count for pagination
    const total = await this.prisma.contact.count({ where });

    // Get paginated results
    const contacts = await this.prisma.contact.findMany({
      where,
      orderBy,
      skip,
      take: pageSize,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        address: true,
        photo: true,
        createdAt: true,
        updatedAt: true,
        userId: true,
      },
    });

    return {
      contacts,
      total,
      page,
      pageSize,
    };
  }

  async createContact(userId: string, contactData: any) {
    return this.prisma.contact.create({
      data: {
        ...contactData,
        userId: userId,
      },
      select: {
        id: true
      },
    });
  }

  async updateContact(userId: string, userRole: string, contactId: string, updateData: any) {
    const where: any = {
      id: contactId,
    };
    
    // Only apply userId filter for non-admin users
    if (userRole !== 'ADMIN') {
      where.userId = userId;
    }

    return this.prisma.contact.update({
      data: updateData,
      where,
      select: {
        id: true
      },
    });
  }

  async deleteContact(userId: string, userRole: string, contactId: string) {
    const where: any = {
      id: contactId,
    };
    
    // Only apply userId filter for non-admin users
    if (userRole !== 'ADMIN') {
      where.userId = userId;
    }

    return this.prisma.contact.delete({
      where,
      select: {
        id: true
      },
    });
  }

  async findContactById(userId: string, userRole: string, contactId: string) {
    const where: any = {
      id: contactId,
    };
    
    // Only apply userId filter for non-admin users
    if (userRole !== 'ADMIN') {
      where.userId = userId;
    }

    return this.prisma.contact.findFirst({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        address: true,
        photo: true,
        createdAt: true,
        updatedAt: true,
        userId: true,
      },
    });
  }

  async getAllContacts() {
    return this.prisma.contact.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        address: true,
        photo: true,
        createdAt: true,
        updatedAt: true,
        userId: true,
      },
    });
  }
} 