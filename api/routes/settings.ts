import { Router, type Request, type Response } from 'express';
import DataStore from '../services/datastore.js';
import type { RecommendRules, RewardRules } from '../../shared/index.js';

const router = Router();

router.get('/recommend-rules', (_req: Request, res: Response) => {
  return res.json({ success: true, data: DataStore.settings.getRecommendRules() });
});

router.post('/recommend-rules', (req: Request, res: Response) => {
  const data = DataStore.settings.updateRecommendRules(req.body as Partial<RecommendRules>);
  return res.json({ success: true, data });
});

router.get('/rewards', (_req: Request, res: Response) => {
  return res.json({ success: true, data: DataStore.settings.getRewardRules() });
});

router.post('/rewards', (req: Request, res: Response) => {
  const data = DataStore.settings.updateRewardRules(req.body as Partial<RewardRules>);
  return res.json({ success: true, data });
});

router.get('/users', (_req: Request, res: Response) => {
  return res.json({ success: true, data: DataStore.settings.getUsers() });
});

router.post('/reports/monthly', (_req: Request, res: Response) => {
  const data = DataStore.reports.monthly();
  return res.setHeader('Content-Type', 'text/csv')
    .setHeader('Content-Disposition', `attachment; filename="${data.filename}"`)
    .send(data.content);
});

export default router;
