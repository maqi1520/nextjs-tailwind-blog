import Head from 'next/head';
import Link from 'next/link';
import { title, email, wechat, about } from '../config';
import Section from '../components/Section';
import React, { useEffect } from 'react';
import { GetStaticProps } from 'next';
import ProjectCard from '../components/ProjectCard';
import PostPreview from '../components/PostPreview';
import Hero from '../components/Hero';
import Icon from '../components/Icon';
import { getLayout } from '../components/Layout';
import { Viewer } from '@bytemd/react';

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
        <div className="custom-markdown-body mt-20">
          <Viewer value={about} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 mt-20 text-skin-base">
          <div className=" text-lg font-semibold">
            <div className="flex justify-center">
              <Icon className="w-6 h-6" type="email" />
              <span className="ml-2">Email</span>
            </div>
            <a
              href={`mailto:${email}`}
              className="mt-1 text-center block transition-colors text-skin-primary hover:text-skin-secondary"
            >
              {email}
            </a>
          </div>
          <div className="text-lg font-semibold">
            <div className="flex justify-center items-center">
              <Icon className="w-6 h-6" type="wechat" />
              <span className="ml-2">Wechat</span>
            </div>
            <div className="mt-1 text-center transition-colors text-skin-primary hover:text-skin-secondary">
              {wechat}
            </div>
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
