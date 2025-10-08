import { tool } from '@langchain/core/tools';
import { z } from 'zod';
import { PrismaService } from 'nestjs-prisma';

export function createDatabaseTools(prisma: PrismaService) {
  
  const getAdminUsers = tool(async () => {
    try {
      const admins = await prisma.user.findMany({
        where: { role: 'ADMIN' },
        select: {
          firstName: true,
          lastName: true,
          email: true,
          department: true,
          isActive: true
        }
      });
      
      const data = admins.length === 0 ? [] : admins;
      return JSON.stringify(data);
    } catch (error) {
      throw new Error(`Database query failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }, {
    name: 'getAdminUsers',
    description: 'Get all admin users in the system',
    schema: z.object({})
  });

  const getUserStats = tool(async () => {
    try {
      const [totalUsers, activeUsers, adminCount] = await Promise.all([
        prisma.user.count(),
        prisma.user.count({ where: { isActive: true } }),
        prisma.user.count({ where: { role: 'ADMIN' } })
      ]);

      return JSON.stringify({
        totalUsers,
        activeUsers,
        adminCount,
        regularUsers: totalUsers - adminCount
      });
    } catch (error) {
      throw new Error(`Database query failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }, {
    name: 'getUserStats',
    description: 'Get user statistics overview',
    schema: z.object({})
  });

  const getTasks = tool(async ({ status }: { status?: string }) => {
    try {
      const where = status ? { status: status as any } : {};
      
      const tasks = await prisma.task.findMany({
        where,
        select: {
          id: true,
          title: true,
          status: true,
          priority: true,
          dueDate: true,
          assigneeId: true
        },
        orderBy: { createdAt: 'desc' }
      });

      return JSON.stringify(tasks);
    } catch (error) {
      throw new Error(`Database query failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }, {
    name: 'getTasks',
    description: 'Get tasks, optionally filtered by status (TODO, IN_PROGRESS, COMPLETED)',
    schema: z.object({
      status: z.string().optional().describe('Filter by task status: TODO, IN_PROGRESS, or COMPLETED')
    })
  });

  const getSystemMetrics = tool(async () => {
    try {
      const metrics = await prisma.systemMetrics.findMany({
        select: {
          metricName: true,
          metricValue: true,
          unit: true,
          category: true
        },
        orderBy: { createdAt: 'desc' }
      });

      return JSON.stringify(metrics);
    } catch (error) {
      throw new Error(`Database query failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }, {
    name: 'getSystemMetrics',
    description: 'Get current system performance metrics',
    schema: z.object({})
  });

  return [
    getAdminUsers,
    getUserStats,
    getTasks,
    getSystemMetrics
  ];
}