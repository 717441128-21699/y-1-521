import { Router, type Request, type Response } from 'express';
import DataStore from '../services/datastore.js';

const router = Router();

router.get('/projects', (_req: Request, res: Response) => {
  const data = DataStore.finance.getAll();
  return res.json({ success: true, data });
});

router.get('/:id/detail', (req: Request, res: Response) => {
  const { id } = req.params;
  const data = DataStore.finance.getDetail(id);
  if (!data) return res.status(404).json({ success: false, error: '财务记录不存在' });
  return res.json({ success: true, data });
});

router.get('/warnings', (_req: Request, res: Response) => {
  const data = DataStore.finance.getWarnings();
  return res.json({ success: true, data });
});

router.post('/remind', (req: Request, res: Response) => {
  const { projectId } = req.body;
  const ok = DataStore.finance.remind(projectId);
  if (!ok) return res.status(404).json({ success: false, error: '项目不存在' });
  return res.json({ success: true });
});

export default router;
