import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedAgentData() {
  console.log('Seeding agent data...');

  // Get users to assign tasks
  const users = await prisma.user.findMany({ take: 5 });
  if (users.length === 0) {
    console.log('No users found. Please run the main seed first.');
    return;
  }

  // Create simple tasks
  const tasks = [
    {
      title: 'Fix login bug',
      description: 'Fix the authentication issue in login page',
      status: 'COMPLETED',
      priority: 'HIGH',
      assigneeId: users[0].id,
      dueDate: new Date('2024-01-15'),
    },
    {
      title: 'Add dark mode',
      description: 'Implement dark mode theme for the application',
      status: 'IN_PROGRESS',
      priority: 'MEDIUM',
      assigneeId: users[1].id,
      dueDate: new Date('2024-03-01'),
    },
    {
      title: 'Update documentation',
      description: 'Update API documentation for new endpoints',
      status: 'TODO',
      priority: 'LOW',
      assigneeId: users[2].id,
      dueDate: new Date('2024-02-15'),
    },
    {
      title: 'Database backup',
      description: 'Setup automated database backup system',
      status: 'COMPLETED',
      priority: 'HIGH',
      assigneeId: users[0].id,
      dueDate: new Date('2024-01-10'),
    },
  ];

  for (const taskData of tasks) {
    await prisma.task.create({ data: taskData as any });
  }

  // Create simple system metrics
  const systemMetrics = [
    {
      metricName: 'CPU Usage',
      metricValue: 65.5,
      unit: '%',
      category: 'Performance',
    },
    {
      metricName: 'Memory Usage',
      metricValue: 78.2,
      unit: '%',
      category: 'Performance',
    },
    {
      metricName: 'Active Users',
      metricValue: 24,
      unit: 'users',
      category: 'Usage',
    },
    {
      metricName: 'API Requests',
      metricValue: 1420,
      unit: 'requests',
      category: 'Usage',
    },
  ];

  for (const metricData of systemMetrics) {
    await prisma.systemMetrics.create({ data: metricData });
  }

  // Update some user info to include new fields
  await prisma.user.updateMany({
    where: { role: 'ADMIN' },
    data: {
      department: 'Engineering',
      jobTitle: 'System Administrator',
      lastLoginAt: new Date(),
    },
  });

  await prisma.user.updateMany({
    where: { role: 'USER' },
    data: {
      department: 'Development',
      jobTitle: 'Software Developer',
      lastLoginAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // Yesterday
    },
  });

  console.log('Agent data seeding completed!');
  console.log(`Created ${tasks.length} tasks and ${systemMetrics.length} system metrics.`);
}

export { seedAgentData };