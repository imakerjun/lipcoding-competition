import { Router } from 'express';

const router = Router();

// TODO: 매칭 요청 관련 라우트 구현
router.post('/match-requests', (req, res) => {
  res.status(501).json({ message: 'Not implemented yet' });
});

router.get('/match-requests/incoming', (req, res) => {
  res.status(501).json({ message: 'Not implemented yet' });
});

router.get('/match-requests/outgoing', (req, res) => {
  res.status(501).json({ message: 'Not implemented yet' });
});

router.put('/match-requests/:id/accept', (req, res) => {
  res.status(501).json({ message: 'Not implemented yet' });
});

router.put('/match-requests/:id/reject', (req, res) => {
  res.status(501).json({ message: 'Not implemented yet' });
});

router.delete('/match-requests/:id', (req, res) => {
  res.status(501).json({ message: 'Not implemented yet' });
});

export default router;
