import { escape } from '@/lib/utils/htmlEscaper'

import siteMetadata from '@/data/siteMetadata'
import { PostFrontMatter } from 'types/PostFrontMatter'

const generateRssItem = (post: PostFrontMatter) => {
  const { images } = post
  const src = Array.isArray(images) ? images[0] : images
  const img = src ? `<img src="${src}" width="800">` : ''
  const summary = post.summary && `<p><small>${post.summary}</small></p>`
  return `
    <item>
      <guid>${siteMetadata.siteUrl}/blog/${post.slug}</guid>
      <title>${escape(post.title)}</title>
      <link>${siteMetadata.siteUrl}/blog/${post.slug}</link>
      ${summary && `<description>${escape(img + summary)}</description>`}
      <pubDate>${new Date(post.date).toUTCString()}</pubDate>
      <author>${siteMetadata.email} (${siteMetadata.author})</author>
      ${post.tags && post.tags.map((t) => `<category>${t}</category>`).join('')}
    </item>
  `
}

const generateRss = (posts: PostFrontMatter[], page = 'feed.xml') => `
  <rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
    <channel>
      <title>${escape(siteMetadata.title)}</title>
      <link>${siteMetadata.siteUrl}/blog</link>
      <description>${escape(siteMetadata.description)}</description>
      <language>${siteMetadata.language}</language>
      <managingEditor>${siteMetadata.email} (${siteMetadata.author})</managingEditor>
      <webMaster>${siteMetadata.email} (${siteMetadata.author})</webMaster>
      <lastBuildDate>${new Date(posts[0].date).toUTCString()}</lastBuildDate>
      <atom:link href="${siteMetadata.siteUrl}/${page}" rel="self" type="application/rss+xml"/>
      ${posts.map(generateRssItem).join('')}
    </channel>
  </rss>
`
export default generateRss
