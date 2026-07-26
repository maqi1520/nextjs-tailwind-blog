const fs = require('fs')
const globby = require('globby')
const matter = require('gray-matter')
const prettier = require('prettier')
const siteMetadata = require('../data/siteMetadata')

;(async () => {
  const prettierConfig = await prettier.resolveConfig('./.prettierrc.js')
  const pages = await globby([
    'src/pages/*.js',
    'src/pages/*.tsx',
    'data/blog/**/*.mdx',
    'data/blog/**/*.md',
    'public/tags/**/*.xml',
    '!src/pages/_*.js',
    '!src/pages/_*.tsx',
    '!src/pages/api',
    '!src/pages/404.js',
    '!src/pages/404.tsx',
  ])

  const urls = pages
    .map((page) => {
      let lastmod
      // Exclude drafts and posts that declare an external canonical URL
      if (/\.mdx?$/.test(page) && fs.existsSync(page)) {
        const source = fs.readFileSync(page, 'utf8')
        const fm = matter(source)
        if (fm.data.draft) {
          return
        }
        if (fm.data.canonicalUrl) {
          return
        }
        const mod = fm.data.lastmod || fm.data.date
        if (mod) {
          lastmod = new Date(mod).toISOString().split('T')[0]
        }
      }

      const routePath = page
        .replace('src/pages/', '/')
        .replace('data/blog', '/blog')
        .replace('public/', '/')
        .replace(/\.js$/, '')
        .replace(/\.tsx$/, '')
        .replace(/\.mdx$/, '')
        .replace(/\.md$/, '')
        .replace('/feed.xml', '')
      const route = routePath === '/index' ? '' : routePath

      if (page.includes('[') || page.includes(']')) {
        return
      }

      const loc = `${siteMetadata.siteUrl}${encodeURI(route)}`
      return lastmod
        ? `
                        <url>
                            <loc>${loc}</loc>
                            <lastmod>${lastmod}</lastmod>
                        </url>
                    `
        : `
                        <url>
                            <loc>${loc}</loc>
                        </url>
                    `
    })
    .filter(Boolean)

  const sitemap = `
        <?xml version="1.0" encoding="UTF-8"?>
        <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
            ${urls.join('')}
        </urlset>
    `

  const formatted = prettier.format(sitemap, {
    ...prettierConfig,
    parser: 'html',
  })

  // Keep robots.txt in sync with the canonical site URL
  const robots = `User-agent: *
Allow: /
Disallow: /bin/
Disallow: /api/

Sitemap: ${siteMetadata.siteUrl}/sitemap.xml
`

  fs.writeFileSync('public/sitemap.xml', formatted)
  fs.writeFileSync('public/robots.txt', robots)
})()
