import { Router, type Request, type Response } from 'express';
import DataStore from '../services/datastore.js';
import type { UserRole } from '../../shared/index.js';

const router = Router();

const extractRole = (req: Request): { role: UserRole; userId: string } => {
  const role = (req.headers['x-user-role'] as UserRole) || 'admin';
  const userId = (req.headers['x-user-id'] as string) || '';
  return { role, userId };
};

router.get('/overview', (req: Request, res: Response) => {
  const { role, userId } = extractRole(req);
  const { dateRange } = req.query;
  let parsedDateRange = undefined;
  if (dateRange && typeof dateRange === 'string') {
    try { parsedDateRange = JSON.parse(decodeURIComponent(dateRange)); } catch (e) {}
  }
  const data = DataStore.dashboard.getOverview(role, userId, parsedDateRange);
  return res.json({ success: true, data });
});

router.get('/realtime', (_req: Request, res: Response) => {
  const data = DataStore.dashboard.getRealtime();
  return res.json({ success: true, data });
});

export default router;
