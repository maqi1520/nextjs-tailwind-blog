import Head from 'next/head';
import { title } from '../../config';
import React, { useMemo, useRef } from 'react';
import axios from 'axios';
import { useAsync } from 'react-use';
import { GetStaticPropsContext } from 'next';
import { getAllSlugs, getPostBySlug } from '../../lib/posts';
import { useRouter } from 'next/router';
import { Toc } from '../../components/Toc';
import { Viewer } from '@bytemd/react';
import footnotes from '@bytemd/plugin-footnotes';
import frontmatter from '@bytemd/plugin-frontmatter';
import gfm from '@bytemd/plugin-gfm';
import plugin_gfm from '@bytemd/plugin-gfm/lib/locales/zh_Hans.json';
import highlight from '@bytemd/plugin-highlight-ssr';
import math from '@bytemd/plugin-math';
import plugin_math from '@bytemd/plugin-math/lib/locales/zh_Hans.json';
import mediumZoom from '@bytemd/plugin-medium-zoom';
import mermaid from '@bytemd/plugin-mermaid';
import plugin_mermaid from '@bytemd/plugin-mermaid/lib/locales/zh_Hans.json';
import gemoji from '@bytemd/plugin-gemoji';
import { Post } from '@prisma/client';

interface Props {
  post: Post;
}

export default function PostPage({ post }: Props) {
  const previewRef = useRef(null);
  const router = useRouter();

  useAsync(async () => {
    const res = await axios.post('/api/post/hits', {
      id: post.id,
    });
    return res.data;
  }, []);

  const plugins = useMemo(
    () => [
      footnotes(),
      frontmatter(),
      gemoji(),
      gfm({ locale: plugin_gfm }),
      highlight(),
      math({
        locale: plugin_math,
        katexOptions: { output: 'html' },
      }),
      mediumZoom(),
      mermaid({
        locale: plugin_mermaid,
      }),
    ],
    []
  );

  const handleClick = (index: number) => {
    const previewEl = previewRef.current;
    if (previewEl) {
      const headings = previewEl.querySelectorAll('h1,h2,h3,h4,h5,h6');
      headings[index].scrollIntoView();
    }
  };

  if (router.isFallback) {
    return <div className="grid place-content-center">Loading...</div>;
  }

  return (
    <>
      <Head>
        <title>
          {post.title}-{title}
        </title>
      </Head>
      <article className="flex flex-col justify-around pb-16 mx-auto space-y-10 text-base">
        <div className="flex flex-col space-y-4">
          <h1 className="inline pt-10 text-4xl text-skin-primary">
            {post.title}
          </h1>
          <div className="text-sm space-x-2 text-skin-muted">
            <span>
              <svg
                className="w-5 h-5 inline-block mr-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              {new Date(post.createdAt).toLocaleDateString()}
            </span>
            <span>
              <svg
                className="w-5 h-5 inline-block mr-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              </svg>
              {post.hits}
            </span>
          </div>
        </div>
        <div className="mt-8 custom-markdown-body flex">
          <div className="flex-auto" ref={previewRef}>
            <Viewer plugins={plugins} value={post.content} />
          </div>
          <div className="w-60 flex-shrink-0">
            <Toc
              previewRef={previewRef}
              className="sticky top-0 "
              onClick={handleClick}
              plugins={plugins}
              value={post.content}
            />
          </div>
        </div>
      </article>
    </>
  );
}

export async function getStaticPaths() {
  const slugs = await getAllSlugs();
  const paths = slugs.map(({ id }) => ({ params: { id: id.toString() } }));
  return {
    paths,
    fallback: 'blocking',
  };
}

export async function getStaticProps(ctx: GetStaticPropsContext) {
  const post = await getPostBySlug(ctx.params.id as string);
  return {
    props: {
      post,
    },
    revalidate: 1,
  };
}
