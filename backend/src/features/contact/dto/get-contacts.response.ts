export class GetContactsResponse {
  data!: Array<{
    id: string;
    name: string;
    email: string | null;
    phone: string | null;
    address: string | null;
    photo: string | null;
    createdAt: Date;
    updatedAt: Date;
    userId: string;
  }>;
  total!: number;
  page!: number;
  pageSize!: number;
} 