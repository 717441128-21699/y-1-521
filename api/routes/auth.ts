import { Router, type Request, type Response } from 'express';
import DataStore from '../services/datastore.js';
import type { UserRole } from '../../shared/index.js';

const router = Router();

router.post('/login', (req: Request, res: Response) => {
  const { phone, password, role } = req.body;
  if (!phone || !password || !role) {
    return res.status(400).json({ success: false, error: '缺少登录参数' });
  }
  const result = DataStore.auth.login(phone as string, password as string, role as UserRole);
  if (!result) {
    return res.status(401).json({ success: false, error: '账号或密码错误' });
  }
  return res.json({ success: true, data: result });
});

export default router;
