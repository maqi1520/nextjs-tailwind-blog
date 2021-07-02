import Head from 'next/head';
import Link from 'next/link';
import { title } from '../config';
import Section from '../components/Section';
import React, { useEffect } from 'react';
import { GetStaticProps } from 'next';
import ProjectCard from '../components/ProjectCard';
import PostPreview from '../components/PostPreview';
import Hero from '../components/Hero';
import { getLayout } from '../components/Layout';

import { getPosts } from '../lib/posts';
import { getProjects } from '../lib/projects';
function Home({ projects = [], posts = [] }) {
  return (
    <>
      <Head>
        <title>{title}</title>
      </Head>
      <Hero />
      <Section title="我的项目" id="project">
        <ul className="flex flex-col gap-10">
          {projects.map((project) => (
            <li key={project.title}>
              <ProjectCard project={project} />
            </li>
          ))}
        </ul>
      </Section>
      <Section title="最新文章" id="blog">
        <ul className="flex flex-col mt-20 space-y-12">
          {posts.map((post) => (
            <li key={post.id}>
              <PostPreview post={post} />
            </li>
          ))}
        </ul>
        <div className="mt-4">
          <Link href="/blog">
            <a className="text-skin-primary"> 更多文章......</a>
          </Link>
        </div>
      </Section>
      <Section title="关于" id="about">
        <div className="grid grid-cols-2 mx-auto mt-20 text-skin-base">
          <div className="w-1/3 mx-auto text-lg font-semibold md:w-auto">
            <div className="flex justify-center">
              <svg
                className="w-6 h-6 text-skin-base"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
              <span className="ml-2">Email</span>
            </div>
            <a
              href="mailto:maqi1520@163.com"
              className="mt-1 transition-colors text-skin-primary hover:text-skin-secondary"
            >
              maqi1520@163.com
            </a>
          </div>
          <div className="w-1/3 mx-auto text-lg font-semibold md:w-auto">
            <div className="flex justify-center items-center">
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
              <span className="ml-2">Wechat</span>
            </div>
            <a
              href="mailto:maqi1520@163.com"
              className="mt-1 transition-colors text-skin-primary hover:text-skin-secondary"
            >
              maqibin1990
            </a>
          </div>
        </div>
      </Section>
    </>
  );
}

Home.getLayout = getLayout;

export default Home;

export const getStaticProps: GetStaticProps = async () => {
  const [postRes, projects] = await Promise.all([
    getPosts({ take: 3, orderBy: { hits: 'desc' } }),
    getProjects(),
  ]);

  return {
    props: {
      projects,
      posts: postRes.data,
    },
  };
};
