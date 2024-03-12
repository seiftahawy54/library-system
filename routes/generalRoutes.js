import { Router } from 'express';

const router = Router();

router.use('*', (req, res) => {
  return res.status(404).send('Nothing here...');
});

router.use((err, req, res) => {
  console.error(err.stack);
  return res.status(err.status || 500).json({ message: err.message });
});

export default router;
