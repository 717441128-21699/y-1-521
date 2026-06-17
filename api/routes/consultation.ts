import { Router, type Request, type Response } from 'express';
import DataStore from '../services/datastore.js';
import type { ConsultationForm } from '../../shared/index.js';

const router = Router();

router.get('/packages', (_req: Request, res: Response) => {
  const data = DataStore.consultation.getPackages();
  return res.json({ success: true, data });
});

router.post('/recommend', (req: Request, res: Response) => {
  const form = req.body as ConsultationForm;
  if (!form || !form.budget || !form.guestCount) {
    return res.status(400).json({ success: false, error: '参数不完整' });
  }
  const data = DataStore.consultation.recommend(form);
  return res.json({ success: true, data });
});

router.post('/lock', (req: Request, res: Response) => {
  const { planId } = req.body;
  if (!planId) return res.status(400).json({ success: false, error: '缺少planId' });
  const result = DataStore.consultation.lockResources(planId as string);
  if (!result) return res.status(404).json({ success: false, error: '套餐不存在' });
  return res.json({ success: true, data: result });
});

router.get('/lock-status/:lockId', (req: Request, res: Response) => {
  const { lockId } = req.params;
  const result = DataStore.consultation.getLockStatus(lockId);
  if (!result) return res.status(404).json({ success: false, error: '锁定记录不存在' });
  return res.json({ success: true, data: result });
});

export default router;
