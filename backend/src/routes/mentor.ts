import { Router } from 'express';

const router = Router();

// TODO: 멘토 관련 라우트 구현
router.get('/mentors', (req, res) => {
  res.status(501).json({ message: 'Not implemented yet' });
});

export default router;
