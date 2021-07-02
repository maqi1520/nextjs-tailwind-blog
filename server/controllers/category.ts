import express from 'express';
import prisma from '../prisma';
import { protect, Req } from '../middleware/auth';

const router = express.Router();
router.get('/query', async (req: Req, res) => {
  const { pageNum = 1, pageSize = 20 } = req.query;
  const data = await prisma.category.findMany({
    skip: +pageSize * (+pageNum - 1),
    take: +pageSize,
  });
  const total = await prisma.project.count();
  res.json({
    data,
    total,
  });
});

router.post('/', protect, async (req: Req, res) => {
  const { name } = req.body;
  const newUser = await prisma.category.create({
    data: {
      name,
    },
  });
  res.json({
    data: newUser,
    success: true,
  });
});

export default router;
