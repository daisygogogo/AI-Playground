import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthenticationGuard } from '../authentication/authentication.guard';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('agent')
@ApiBearerAuth()
@Controller('agent')
@UseGuards(AuthenticationGuard)
export class AgentController {

  @ApiOperation({ summary: 'Get available agent tools' })
  @ApiResponse({ status: 200, description: 'List of available tools' })
  @Get('tools')
  getTools() {
    return {
      tools: [
        { name: 'getAdminUsers', description: 'Get all admin users in the system' },
        { name: 'getUserStats', description: 'Get user statistics overview' },
        { name: 'getTasks', description: 'Get tasks, optionally filtered by status' },
        { name: 'getSystemMetrics', description: 'Get current system performance metrics' }
      ],
      count: 4,
      timestamp: new Date().toISOString()
    };
  }

  @ApiOperation({ summary: 'Get example queries for database agent' })
  @ApiResponse({ status: 200, description: 'List of example queries' })
  @Get('examples')
  getExamples() {
    return {
      examples: [
        {
          category: 'User Management',
          queries: [
            'Who are the admin users in the system?',
            'Show me user statistics',
            'How many active users do we have?',
            'List users by department'
          ]
        },
        {
          category: 'Task Management',
          queries: [
            'What tasks are in progress?',
            'Show high priority tasks',
            'List completed tasks',
            'What tasks are overdue?'
          ]
        },
        {
          category: 'System Metrics',
          queries: [
            'Show me system performance metrics',
            'What are the latest system metrics?',
            'Display metrics by category',
            'Show database performance data'
          ]
        }
      ],
      timestamp: new Date().toISOString()
    };
  }
}