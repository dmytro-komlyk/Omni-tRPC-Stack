import { z } from 'zod';

export const notificationSeverity = z.enum(['info', 'success', 'warning', 'error', 'critical']);

export type NotificationSeverity = z.TypeOf<typeof notificationSeverity>;

export const notificationSchema = z.object({
  id: z.string(),
});

export type NotificationData = z.TypeOf<typeof notificationSchema>;
