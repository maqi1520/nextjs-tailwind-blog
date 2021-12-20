import React from 'react';
import { getPosts } from '../lib/posts';
import fs from 'fs';

const Sitemap = () => {};

export const getServerSideProps = async ({ res }) => {
  const baseUrl = {
    development: 'http://localhost:3000',
    production: 'https://maqib.cn',
  }[process.env.NODE_ENV];

  const staticPages = fs
    .readdirSync('./src/pages')
    .filter((staticPage) => {
      return ![
        'admin',
        'index.tsx',
        '_app.tsx',
        '_document.tsx',
        '_error.tsx',
        'sitemap.xml.tsx',
      ].includes(staticPage);
    })
    .map((staticPagePath) => {
      return `${baseUrl}/${staticPagePath}`;
    });

  const { data } = await getPosts({
    skip: 0,
    take: 10000,
    where: {
      published: 1,
    },
    orderBy: { createdAt: 'desc' },
  });

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
      ${staticPages
        .map((url) => {
          return `
            <url>
              <loc>${url}</loc>
              <lastmod>${new Date().toISOString()}</lastmod>
              <changefreq>daily</changefreq>
              <priority>1.0</priority>
            </url>
          `;
        })
        .join('')}
      ${data
        .map(({ id, createdAt }) => {
          return `
              <url>
                <loc>${baseUrl}/blog/${id}</loc>
                <lastmod>${new Date(createdAt).toISOString()}</lastmod>
                <changefreq>daily</changefreq>
                <priority>1.0</priority>
              </url>
            `;
        })
        .join('')}
    </urlset>
  `;

  res.setHeader('Content-Type', 'text/xml');
  res.write(sitemap);
  res.end();

  return {
    props: {},
  };
};

export default Sitemap;
