import prisma from '../../server/prisma';

export async function getProjects() {
  return await prisma.project.findMany({
    orderBy: {
      order: 'asc',
    },
  });
}
