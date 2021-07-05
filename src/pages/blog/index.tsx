import Head from 'next/head';
import { title } from '../../config';
import PostPreview from '../../components/PostPreview';
import Section from '../../components/Section';
import Pagination from '../../components/Pagination';
import { getLayout } from '../../components/Layout';
import { getPosts } from '../../lib/posts';
import { useRouter } from 'next/router';
import { GetServerSidePropsContext } from 'next';
import { Post, Category } from '@prisma/client';

type TPost = Post & { categories: Category[] };

interface Props {
  pageSize: number;
  pageNum: number;
  posts: TPost[];
  total: number;
}

export default function Blog({ posts, pageSize, pageNum, total }: Props) {
  const router = useRouter();

  const handlePageChange = (current: number, pageSize: number) => {
    router.push({
      pathname: '/blog',
      query: {
        pageSize,
        pageNum: current,
      },
    });
  };
  return (
    <>
      <Head>
        <title>全部文章-{title}</title>
      </Head>
      <Section title="全部文章" id="blog">
        <ul className="flex flex-col mt-20 space-y-20">
          {posts.map((post) => (
            <li key={post.id}>
              <PostPreview post={post} />
            </li>
          ))}
        </ul>
      </Section>
      <Pagination
        pageSize={pageSize}
        onChange={handlePageChange}
        current={pageNum}
        total={total}
      />
    </>
  );
}
Blog.getLayout = getLayout;

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
  const { pageNum = 1, pageSize = 20 } = ctx.query;

  const { data, total } = await getPosts({
    skip: +pageSize * (+pageNum - 1),
    take: +pageSize,
    where: {
      published: 1,
    },
    orderBy: { createdAt: 'desc' },
  });

  return {
    props: {
      pageSize,
      pageNum,
      posts: data,
      total,
    },
  };
}
