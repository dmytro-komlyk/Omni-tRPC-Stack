import { Tool, tool } from 'ai';
import z from 'zod';

import { statsTools } from './stats.tools';
import { systemTools } from './system.tools';
import { usersTools } from './users.tools';

export const createTools = (isAdmin: boolean): Record<string, Tool<any, any>> => ({
  // --- statsTools ---
  getUserCounts: tool({
    description: 'Get counts of users grouped by their roles',
    parameters: z.object({}),
    execute: async () => await statsTools.getUserCounts(),
  } as any),

  getGrowthRate: tool({
    description: 'Get user growth statistics (total and last 24h)',
    parameters: z.object({}),
    execute: async () => await statsTools.getGrowthRate(),
  } as any),

  getRoleDistribution: tool({
    description: 'Get a list of all roles and how many users each has',
    parameters: z.object({}),
    execute: async () => await statsTools.getRoleDistribution(),
  } as any),

  exportUsersToCSV: tool({
    description: 'Export the entire user database to a CSV file and get a download link',
    parameters: z.object({}),
    execute: async () => {
      if (!isAdmin) return 'Error: Permission denied';
      return await statsTools.exportUsersToCSV();
    },
  } as any),

  // --- usersTools ---
  getAdminList: tool({
    description: 'Get a formatted list of all administrators',
    parameters: z.object({}),
    execute: async () => {
      if (!isAdmin) return 'Error: Permission denied';
      return await usersTools.getAdminList();
    },
  } as any),

  getUsersByRole: tool({
    description: 'Get a list of users filtered by a specific role',
    parameters: z.object({
      role: z.enum(['ADMIN', 'USER', 'MODERATOR', 'SUPER_ADMIN']),
    }),
    execute: async ({ role }: { role: any }) => await usersTools.getUsersByRole({ role }),
  } as any),

  getRecentUsers: tool({
    description: 'Get a list of recently registered users in CSV format',
    parameters: z.object({
      limit: z.number().min(1).max(50).optional().default(5),
    }),
    execute: async ({ limit }: { limit: any }) => await usersTools.getRecentUsers({ limit }),
  } as any),

  findUser: tool({
    description: 'Find a specific user by their email address',
    parameters: z.object({
      email: z.string().email(),
    }),
    execute: async ({ email }: { email: any }) => await usersTools.findUser({ email }),
  } as any),

  // --- systemTools ---
  getSystemStatus: tool({
    description: 'Check current system operational status and support time',
    parameters: z.object({}),
    execute: async () => await systemTools.getSystemStatus(),
  } as any),
});
