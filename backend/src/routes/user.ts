import { Router } from 'express';

const router = Router();

// TODO: 사용자 관련 라우트 구현
router.get('/me', (req, res) => {
  res.status(501).json({ message: 'Not implemented yet' });
});

router.put('/profile', (req, res) => {
  res.status(501).json({ message: 'Not implemented yet' });
});

router.get('/images/:role/:id', (req, res) => {
  res.status(501).json({ message: 'Not implemented yet' });
});

export default router;
