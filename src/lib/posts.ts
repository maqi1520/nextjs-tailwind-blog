import prisma from '../../server/prisma';
import type { Prisma } from '@prisma/client';

type getPostsArgs = Omit<Prisma.PostFindManyArgs, 'select'>;

export async function getPosts(opts?: getPostsArgs) {
  const { where, skip, take, orderBy } = opts;
  const data = await prisma.post.findMany({
    select: {
      id: true,
      createdAt: true,
      slug: true,
      title: true,
      summary: true,
      categories: {
        select: {
          name: true,
          id: true,
        },
      },
    },
    where,
    skip,
    take,
    orderBy,
    ...opts,
  });

  const total = await prisma.post.count({
    where,
  });

  return {
    data: data.map((post) => ({
      ...post,
      createdAt: post.createdAt.toString(),
    })),
    total,
  };
}

export async function getAllSlugs() {
  const slugs = await prisma.post.findMany({
    select: {
      id: true,
    },
  });

  return slugs;
}

export async function getPostBySlug(id: string) {
  const post = await prisma.post.findUnique({
    where: {
      id: Number(id),
    },
  });

  const stringDate = new Date(post.createdAt).toString();
  // const renderedContent = (
  //   await remark().use(remarkPrism).use(html).process(post.content)
  // ).toString();

  return {
    ...post,
    createdAt: stringDate,
    //content: renderedContent,
  };
}
