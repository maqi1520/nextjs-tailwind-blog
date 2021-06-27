import express from 'express';
import prisma from '../prisma';
import { protect, Req } from '../middleware/auth';

const router = express.Router();
router.get('/', protect, async (req: Req, res) => {
  const { pageNum = 1, pageSize = 20 } = req.query;
  const data = await prisma.project.findMany({
    where: {
      userId: req.user.id,
    },
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
  const { title, description, order, repoUrl, appUrl } = req.body;
  const newUser = await prisma.project.create({
    data: {
      userId: req.user.id,
      title,
      description,
      order,
      repoUrl,
      appUrl,
    },
  });
  res.json({
    data: newUser,
    success: true,
  });
});

export default router;
