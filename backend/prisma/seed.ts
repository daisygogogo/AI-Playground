import { PrismaClient, Role } from '@prisma/client';
import { hash } from 'bcrypt';

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

  // eslint-disable-next-line no-console
  console.log('Test user created with email: test@example.com, password: 123456, role: USER');
  console.log('Admin user created with email: admin@example.com, password: 123456, role: ADMIN');
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
