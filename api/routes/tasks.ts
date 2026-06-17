import { Router, type Request, type Response } from 'express';
import DataStore from '../services/datastore.js';

const router = Router();

const extractUser = (req: Request): { vendorId: string; userId: string } => {
  const vendorId = (req.headers['x-user-id'] as string) || '';
  return { vendorId, userId: vendorId };
};

router.get('/', (req: Request, res: Response) => {
  const { vendorId } = extractUser(req);
  DataStore.tasks.checkAutoReassign();
  const data = DataStore.tasks.getByVendor(vendorId);
  return res.json({ success: true, data });
});

router.post('/check-auto-reassign', (_req: Request, res: Response) => {
  const data = DataStore.tasks.checkAutoReassign();
  return res.json({ success: true, data, count: data.length });
});

router.post('/:id/accept', (req: Request, res: Response) => {
  const { id } = req.params;
  const { vendorId } = extractUser(req);
  const result = DataStore.tasks.accept(id, vendorId);
  if (!result) return res.status(404).json({ success: false, error: '任务不存在或无权限' });
  return res.json({ success: true, data: result });
});

router.post('/:id/reassign', (req: Request, res: Response) => {
  const { id } = req.params;
  const result = DataStore.tasks.reassign(id);
  if (!result) return res.status(404).json({ success: false, error: '任务不存在' });
  return res.json({ success: true, data: result });
});

router.post('/:id/submit', (req: Request, res: Response) => {
  const { id } = req.params;
  const { vendorId } = extractUser(req);
  const { mediaUrls, note } = req.body;
  const result = DataStore.tasks.submit(id, vendorId, mediaUrls || [], note || '');
  if (!result) return res.status(404).json({ success: false, error: '任务不存在或无权限' });
  return res.json({ success: true, data: result });
});

router.post('/:id/verify', (req: Request, res: Response) => {
  const { id } = req.params;
  const { rating, comment } = req.body;
  const result = DataStore.tasks.verify(id, rating || 5, comment || '');
  if (!result) return res.status(404).json({ success: false, error: '任务不存在或状态错误' });
  return res.json({ success: true, data: result });
});

export default router;
