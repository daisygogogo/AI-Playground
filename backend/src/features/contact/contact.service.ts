import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { AppError } from '../../core/enums/app-error.enum';
import { ContactRepository } from './contact.repository';
import { CreateContactRequest } from './dto/create-contact.request';
import { UpdateContactRequest } from './dto/update-contact.request';
import { GetContactsResponse } from './dto/get-contacts.response';
import { GetContactsRequest } from './dto/get-contacts.request';

@Injectable()
export class ContactService {
  private readonly logger = new Logger('ContactService');

  constructor(
    private readonly contactRepository: ContactRepository,
  ) {}

  async getContacts(userId: string, userRole: string, query?: GetContactsRequest): Promise<GetContactsResponse> {
    this.logger.log(`[GetContacts]: regular user "${userId}" retrieving their contacts`);
      

    const result = await this.contactRepository.getContactsWithFilters(userId, userRole, query);
    return {
      data: result.contacts,
      total: result.total,
      page: result.page,
      pageSize: result.pageSize
    };
      
  }

  async getContact(userId: string, userRole: string, contactId: string) {
    try {
      const contact = await this.contactRepository.findContactById(userId, userRole, contactId);
      if (!contact) {
        throw new BadRequestException({
          code: AppError.CONTACT_NOT_FOUND,
          message: 'Contact not found or access denied',
        });
      }
      this.logger.log(`[GetContact]: contact "${contactId}" retrieved successfully for user "${userId}"`);
      return contact;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      this.logger.error(`[GetContact]: failed to retrieve contact "${contactId}" for user "${userId}": ${error}`);
      throw new BadRequestException({
        code: AppError.CONTACT_OPERATION_FAILED,
        message: 'Unable to retrieve contact',
      });
    }
  }

  async createContact(userId: string, createContactRequest: CreateContactRequest) {
    try {
      const contact = await this.contactRepository.createContact(userId, createContactRequest);
      this.logger.log(`[CreateContact]: contact created successfully`);
      return { contact };
    } catch {
      throw new BadRequestException({
        code: AppError.CONTACT_OPERATION_FAILED,
        message: `Unable to create contact`,
      });
    }
  }

  async updateContact(userId: string, userRole: string, contactId: string, updateContactRequest: UpdateContactRequest) {
    try {
      const contact = await this.contactRepository.updateContact(userId, userRole, contactId, updateContactRequest);
      this.logger.log(`[UpdateContact]: contact updated successfully`);
      return { contact };
    } catch {
      throw new BadRequestException({
        code: AppError.CONTACT_OPERATION_FAILED,
        message: `Unable to update contact`,
      });
    }
  }

  async deleteContact(userId: string, userRole: string, contactId: string) {
    try {
      const deletedContact = await this.contactRepository.deleteContact(userId, userRole, contactId);
      this.logger.log(`[DeleteContact]: contact "${contactId}" deleted successfully for user "${userId}"`);
      return { 
        message: 'Contact deleted successfully',
        contact: deletedContact 
      };
    } catch (error) {
      this.logger.error(`[DeleteContact]: failed to delete contact "${contactId}" for user "${userId}": ${error}`);
      throw new BadRequestException({
        code: AppError.CONTACT_OPERATION_FAILED,
        message: `Unable to delete contact`,
      });
    }
  }
} 