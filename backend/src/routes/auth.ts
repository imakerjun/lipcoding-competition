import { Router } from 'express';

const router = Router();

// TODO: 인증 라우트 구현
router.post('/signup', (req, res) => {
  res.status(501).json({ message: 'Not implemented yet' });
});

router.post('/login', (req, res) => {
  res.status(501).json({ message: 'Not implemented yet' });
});

export default router;
