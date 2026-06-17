import { Router, type Request, type Response } from 'express';
import DataStore from '../services/datastore.js';
import type { UserRole, WeddingProject } from '../../shared/index.js';

const router = Router();

const extractRole = (req: Request): { role: UserRole; userId: string } => {
  const role = (req.headers['x-user-role'] as UserRole) || 'admin';
  const userId = (req.headers['x-user-id'] as string) || '';
  return { role, userId };
};

router.get('/', (req: Request, res: Response) => {
  const { role, userId } = extractRole(req);
  const data = DataStore.projects.getAll(role, userId);
  return res.json({ success: true, data });
});

router.get('/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const data = DataStore.projects.getById(id);
  if (!data) return res.status(404).json({ success: false, error: '项目不存在' });
  return res.json({ success: true, data });
});

router.post('/', (req: Request, res: Response) => {
  const data = DataStore.projects.create(req.body as Partial<WeddingProject>);
  return res.status(201).json({ success: true, data });
});

export default router;
