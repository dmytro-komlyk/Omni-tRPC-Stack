import { prisma, User } from '@package/prisma';
import fs from 'fs';
import path from 'path';

import { UserRole } from '../../auth/auth.schema';

export const statsTools = {
  getUserCounts: async () => {
    const counts = await prisma.user.groupBy({
      by: ['role'],
      _count: { _all: true },
    });
    return counts
      .map((c: { role: UserRole; _count: { _all: number } }) => `${c.role}: ${c._count._all}`)
      .join('\n');
  },
  getGrowthRate: async () => {
    const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const [total, newUsers] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { createdAt: { gte: dayAgo } } }),
    ]);

    return `Total users: ${total}
New users (24h): ${newUsers}`;
  },
  getRoleDistribution: async () => {
    const roles = await prisma.user.groupBy({
      by: ['role'],
      _count: { _all: true },
    });

    if (roles.length === 0) return 'Information not found in database';

    return roles
      .map((r: { role: any; _count: { _all: any } }) => `${r.role}: ${r._count._all}`)
      .join('\n');
  },
  exportUsersToCSV: async () => {
    const users = await prisma.user.findMany({
      select: {
        email: true,
        nickName: true,
        role: true,
        status: true,
        createdAt: true,
      },
    });

    if (users.length === 0) return 'Information not found in database';

    const header = 'NickName,Email,Role,Status,RegisteredAt\n';

    const rows = users
      .map(
        (u: Pick<User, 'nickName' | 'email' | 'role' | 'status' | 'createdAt'>) =>
          `${u.nickName || 'User'},${u.email},${u.role},${u.status},${u.createdAt.toISOString()}`
      )
      .join('\n');

    const fileName = `users_export_${Date.now()}.csv`;
    const assetsDir = process.env.APP_STATIC_ASSETS || 'static';
    const filePath = path.join(process.cwd(), assetsDir, 'exports', fileName);

    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, header + rows);

    const url = `${process.env.APP_BASE_URL}/${assetsDir}/exports/${fileName}`;

    return `FILE_READY|${url}|${fileName}`;
  },
};
