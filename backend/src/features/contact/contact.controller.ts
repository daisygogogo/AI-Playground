import {
  Body,
  Controller,
  Delete,
  Get,
  Logger,
  Param,
  Post,
  Put,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ContactService } from './contact.service';
import { CreateContactRequest } from './dto/create-contact.request';
import { UpdateContactRequest } from './dto/update-contact.request';
import { GetContactsRequest } from './dto/get-contacts.request';
import { GetContactsResponse } from './dto/get-contacts.response';
import { AuthenticationGuard } from '../authentication/authentication.guard';
import { CoreApiResponse } from '../../common/core-api-response';
import { Contact } from '@prisma/client';
import { AuthenticatedRequest } from '../../common/types/auth.types';

@Controller('contacts')
export class ContactController {
  private readonly logger = new Logger('ContactController');

  constructor(private readonly contactService: ContactService) {}

  @Get('')
  @UseGuards(AuthenticationGuard)
  async getContacts(
    @Request() { userId, userRole }: AuthenticatedRequest,
    @Query() query: GetContactsRequest
  ): Promise<CoreApiResponse<GetContactsResponse>> {
    this.logger.log(`[GetContacts]: user with id "${userId}" and role "${userRole}" retrieving contacts with query: ${JSON.stringify(query)}`);
    const result = await this.contactService.getContacts(userId, userRole, query);
    return CoreApiResponse.success(result, 'Contacts retrieved successfully');
  }

  @Get(':id')
  @UseGuards(AuthenticationGuard)
  async getContact(
    @Request() { userId, userRole }: AuthenticatedRequest,
    @Param('id') contactId: string,
  ): Promise<CoreApiResponse<Contact>> {
    this.logger.log(`[GetContact]: user with id "${userId}" and role "${userRole}" retrieving contact "${contactId}"`);
    const result = await this.contactService.getContact(userId, userRole, contactId);
    return CoreApiResponse.success(result, 'Contact retrieved successfully');
  }

  @Post('')
  @UseGuards(AuthenticationGuard)
  async createContact(
    @Request() { userId, userRole }: AuthenticatedRequest,
    @Body() createContactRequest: CreateContactRequest,
  ) {
    this.logger.log(`[CreateContact]: user with id "${userId}" and role "${userRole}" creating contact`);
    return this.contactService.createContact(userId, createContactRequest);
  }

  @Put(':id')
  @UseGuards(AuthenticationGuard)
  async updateContact(
    @Request() { userId, userRole }: AuthenticatedRequest,
    @Param('id') contactId: string,
    @Body() updateContactRequest: UpdateContactRequest,
  ) {
    this.logger.log(`[UpdateContact]: user with id "${userId}" and role "${userRole}" updating contact "${contactId}"`);
    return this.contactService.updateContact(userId, userRole, contactId, updateContactRequest);
  }

  @Delete(':id')
  @UseGuards(AuthenticationGuard)
  async deleteContact(
    @Request() { userId, userRole }: AuthenticatedRequest,
    @Param('id') contactId: string,
  ) {
    this.logger.log(`[DeleteContact]: user with id "${userId}" and role "${userRole}" deleting contact "${contactId}"`);
    return this.contactService.deleteContact(userId, userRole, contactId);
  }
} 