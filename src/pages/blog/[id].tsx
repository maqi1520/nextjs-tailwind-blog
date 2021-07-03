import Head from 'next/head';
import { title } from '../../config';
import React, { useMemo, useRef, useEffect } from 'react';
import { GetStaticPropsContext } from 'next';
import { getAllSlugs, getPostBySlug } from '../../lib/posts';
import { hits } from '../../lib/services';
import { useRouter } from 'next/router';
import { Toc } from '../../components/Toc';
import Icon from '../../components/Icon';
import { getLayout } from '../../components/Layout';
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

  useEffect(() => {
    hits(post.id);
  }, [post.id]);

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
              <Icon className="w-5 h-5 inline-block mr-1" type="clock" />
              {new Date(post.createdAt).toLocaleDateString()}
            </span>
            <span>
              <Icon className="w-5 h-5 inline-block mr-1" type="hits" />
              {post.hits}
            </span>
          </div>
        </div>
        <div className="mt-8 flex">
          <div className="flex-auto custom-markdown-body" ref={previewRef}>
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

PostPage.getLayout = getLayout;

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
