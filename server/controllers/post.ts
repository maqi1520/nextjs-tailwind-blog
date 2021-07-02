import express from 'express';
import prisma from '../prisma';
import { Post, Category } from '@prisma/client';
import { protect, Req } from '../middleware/auth';

type PostBody = Post & {
  categories: Category[];
};

const router = express.Router();
router.get('/', protect, async (req: Req, res) => {
  const { pageNum = 1, pageSize = 20, ...opts } = req.query;
  const allPostsData = await prisma.post.findMany({
    select: {
      id: true,
      createdAt: true,
      slug: true,
      title: true,
      summary: true,
      categories: true,
      published: true,
    },
    where: {
      userId: req.user.id,
    },
    skip: +pageSize * (+pageNum - 1),
    take: +pageSize,
    ...opts,
  });
  const total = await prisma.post.count({
    where: {
      userId: req.user.id,
    },
  });
  res.json({
    data: allPostsData,
    total,
  });
});

router.get('/query', async (req: Req, res) => {
  const { pageNum = 1, pageSize = 20, ...opts } = req.query;
  const allPostsData = await prisma.post.findMany({
    select: {
      id: true,
      createdAt: true,
      slug: true,
      title: true,
      summary: true,
      categories: true,
    },
    where: {
      published: 1,
    },
    skip: +pageSize * (+pageNum - 1),
    take: +pageSize,
    ...opts,
  });
  const total = await prisma.post.count({
    where: {
      published: 1,
    },
  });
  res.json({
    data: allPostsData,
    total,
  });
});

router.get('/:id', async (req: Req, res) => {
  const { id } = req.params;
  const post = await prisma.post.findUnique({
    where: {
      id: Number(id),
    },
    include: {
      categories: true,
    },
  });
  res.json(post);
});

router.post('/', protect, async (req: Req, res) => {
  const { title, summary, slug, content, published, categories } =
    req.body as PostBody;
  const connectOrCreate = categories.map(({ name }) => {
    return {
      create: {
        name,
      },
      where: {
        name,
      },
    };
  });
  const newUser = await prisma.post.create({
    data: {
      title,
      summary,
      slug,
      content,
      published,
      categories: {
        connectOrCreate,
      },
      user: {
        connect: {
          id: req.user.id,
        },
      },
    },
    include: {
      categories: true,
    },
  });
  res.json({
    data: newUser,
    success: true,
  });
});

router.put('/:id', protect, async (req: Req, res) => {
  const { id } = req.params;
  const { title, summary, slug, content, published, categories } =
    req.body as PostBody;
  const connectOrCreate = categories.map(({ name }) => {
    return {
      create: {
        name,
      },
      where: {
        name,
      },
    };
  });
  const newUser = await prisma.post.update({
    where: {
      id: +id,
    },
    data: {
      title,
      summary,
      slug,
      content,
      published,
      categories: {
        connectOrCreate,
      },
    },
    include: {
      categories: true,
    },
  });
  res.json({
    data: newUser,
    success: true,
  });
});

router.post('/hits', async (req: Req, res) => {
  const { id } = req.body;
  const hits = await prisma.post.update({
    where: {
      id,
    },
    select: {
      hits: true,
    },
    data: {
      hits: {
        increment: 1,
      },
    },
  });
  res.json({
    data: hits,
    success: true,
  });
});

router.delete('/:id', protect, async (req: Req, res) => {
  const { id } = req.params;
  const data = await prisma.post.delete({
    where: {
      id: Number(id),
    },
  });
  res.json({
    data,
    success: true,
  });
});

export default router;
