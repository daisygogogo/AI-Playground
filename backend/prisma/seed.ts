import { PrismaClient, Role } from '@prisma/client';
import { hash } from 'bcrypt';
import { seedAgentData } from './seed-agent-data';

const prisma = new PrismaClient();

async function main() {
  await prisma.user.deleteMany();

  // eslint-disable-next-line no-console
  console.log('Seeding...');

  // Create a test user with a simple password for testing
  const testPassword = '123456';
  const hashedPassword = await hash(testPassword, 10);

  await prisma.user.create({
    data: {
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
      password: hashedPassword,
      terms: true,
      role: Role.USER,
    },
  });

  // Create an admin user
  await prisma.user.create({
    data: {
      email: 'admin@example.com',
      firstName: 'Admin',
      lastName: 'User',
      password: hashedPassword,
      terms: true,
      role: Role.ADMIN,
    },
  });

  // Create more sample users for agent testing
  const sampleUsers = [
    {
      email: 'john.doe@example.com',
      firstName: 'John',
      lastName: 'Doe',
      role: Role.USER,
      department: 'Engineering',
      jobTitle: 'Senior Developer',
    },
    {
      email: 'jane.smith@example.com',
      firstName: 'Jane',
      lastName: 'Smith',
      role: Role.ADMIN,
      department: 'Product',
      jobTitle: 'Product Manager',
    },
    {
      email: 'bob.wilson@example.com',
      firstName: 'Bob',
      lastName: 'Wilson',
      role: Role.USER,
      department: 'Design',
      jobTitle: 'UI/UX Designer',
    },
  ];

  for (const userData of sampleUsers) {
    await prisma.user.create({
      data: {
        ...userData,
        password: hashedPassword,
        terms: true,
        lastLoginAt: new Date(),
      },
    });
  }

  // Seed agent-specific data
  await seedAgentData();

  // eslint-disable-next-line no-console
  console.log('Test user created with email: test@example.com, password: 123456, role: USER');
  console.log('Admin user created with email: admin@example.com, password: 123456, role: ADMIN');
  console.log(`Created ${sampleUsers.length} additional sample users`);
  console.log('Agent data seeded successfully');
  console.log('Data loaded!');
}

// eslint-disable-next-line promise/catch-or-return
main()
  .catch((error) => {
    // eslint-disable-next-line no-console
    console.error(error);
  })
  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  .finally(async () => {
    await prisma.$disconnect();
  });
