/* eslint-disable @next/next/no-img-element */
import Link from '@/components/Link'
import PageTitle from '@/components/PageTitle'
import SectionContainer from '@/components/SectionContainer'
import { BlogSEO } from '@/components/SEO'
import Image from '@/components/Image'
import Tag from '@/components/Tag'
import siteMetadata from '@/data/siteMetadata'
import Comments from '@/components/comments'
import ScrollTopAndComment from '@/components/ScrollTopAndComment'
import ProgressBar from '@/components/ProgressBar'
import TOCInline from '@/components/TOCInline'
import { ReactNode } from 'react'
import { PostFrontMatter } from 'types/PostFrontMatter'
import { AuthorFrontMatter } from 'types/AuthorFrontMatter'
import { Toc } from 'types/Toc'

const editUrl = (fileName) => `${siteMetadata.siteRepo}/blob/main/data/blog/${fileName}`

const postDateTemplate: Intl.DateTimeFormatOptions = {
  weekday: 'long',
  year: 'numeric',
  month: 'long',
  day: 'numeric',
}

interface Props {
  toc: Toc
  frontMatter: PostFrontMatter
  authorDetails: AuthorFrontMatter[]
  next?: { slug: string; title: string }
  prev?: { slug: string; title: string }
  children: ReactNode
}

export default function PostLayout(props: Props) {
  const { frontMatter, authorDetails, next, prev, children } = props
  const { slug, fileName, date, title, tags, images } = frontMatter
  const src = Array.isArray(images) ? images[0] : images

  return (
    <SectionContainer>
      <BlogSEO
        url={`${siteMetadata.siteUrl}/blog/${slug}`}
        authorDetails={authorDetails}
        {...frontMatter}
      />
      <ProgressBar />
      <ScrollTopAndComment />
      <article>
        <div className="xl:divide-y xl:divide-gray-200 xl:dark:divide-gray-700">
          <header className="pt-6 xl:pb-6">
            <div className="space-y-1 text-center">
              <dl className="space-y-10">
                <div>
                  <dt className="sr-only">Published on</dt>
                  <dd className="text-base font-medium leading-6 text-gray-500 dark:text-gray-400">
                    <time dateTime={date}>
                      {new Date(date).toLocaleDateString(siteMetadata.locale, postDateTemplate)}
                    </time>
                  </dd>
                </div>
              </dl>
              <div>
                <PageTitle>{title}</PageTitle>
              </div>
            </div>
          </header>
          <div
            className="divide-y divide-gray-200 pb-8 dark:divide-gray-700 xl:grid xl:grid-cols-4 xl:gap-x-6 xl:divide-y-0"
            style={{ gridTemplateRows: 'auto 1fr' }}
          >
            <div className="">
              <dl className="pt-6 pb-10 xl:border-b xl:border-gray-200 xl:pt-11 xl:dark:border-gray-700">
                <dt className="sr-only">Authors</dt>
                <dd>
                  <ul className="flex justify-center space-x-8 sm:space-x-12 xl:block xl:space-x-0 xl:space-y-8">
                    {authorDetails.map((author) => (
                      <li className="flex items-center space-x-2" key={author.name}>
                        {author.avatar && (
                          <Image
                            src={author.avatar}
                            width="38px"
                            height="38px"
                            alt="avatar"
                            className="h-10 w-10 rounded-full"
                          />
                        )}
                        <dl className="whitespace-nowrap text-sm font-medium leading-5">
                          <dt className="sr-only">作者</dt>
                          <dd className="text-gray-900 dark:text-gray-100">{author.name}</dd>
                        </dl>
                      </li>
                    ))}
                  </ul>
                </dd>
              </dl>
              <h2 className="pt-6 text-xs font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                目录
              </h2>
              <TOCInline asDisclosure={false} toc={props.toc} />
            </div>
            <div className="xl:col-span-3 xl:row-span-2 xl:pb-0">
              {src ? (
                <div className="mt-6">
                  <img alt={title} className="w-full rounded object-cover shadow-lg" src={src} />
                </div>
              ) : null}
              <div className="prose max-w-none break-words pt-10 pb-8 dark:prose-dark">
                {children}
              </div>
              <div className="border-t border-gray-200 pt-6 pb-6 text-sm text-gray-700 dark:border-gray-700 dark:text-gray-300">
                <div className="mb-3">
                  <Image
                    alt="runjs-cool"
                    width={384}
                    height={140}
                    src={`/static/images/runjs-cool.webp`}
                  />
                </div>

                <span>关注微信公众号，获取最新原创文章（首发）</span>
                <Link href={editUrl(fileName)}>{'View on GitHub'}</Link>
              </div>
              <Comments frontMatter={frontMatter} />
            </div>
            <footer>
              <div className="divide-gray-200 text-sm font-medium leading-5 dark:divide-gray-700 xl:col-start-1 xl:row-start-2 xl:divide-y">
                {tags && (
                  <div className="py-4 xl:py-8">
                    <h2 className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
                      标签
                    </h2>
                    <div className="mt-3 flex flex-wrap">
                      {tags.map((tag) => (
                        <Tag key={tag} text={tag} />
                      ))}
                    </div>
                  </div>
                )}
                {(next || prev) && (
                  <div className="flex justify-between py-4 xl:block xl:space-y-8 xl:py-8">
                    {prev && (
                      <div>
                        <h2 className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
                          上一篇 文章
                        </h2>
                        <div className="mt-3 text-primary-500 hover:text-primary-600 dark:hover:text-primary-400">
                          <Link href={`/blog/${prev.slug}`}>{prev.title}</Link>
                        </div>
                      </div>
                    )}
                    {next && (
                      <div>
                        <h2 className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
                          下一篇 文章
                        </h2>
                        <div className="mt-3 text-primary-500 hover:text-primary-600 dark:hover:text-primary-400">
                          <Link href={`/blog/${next.slug}`}>{next.title}</Link>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
              <div className="pt-4 xl:pt-8">
                <Link
                  href="/blog"
                  className="text-primary-500 hover:text-primary-600 dark:hover:text-primary-400"
                >
                  &larr; 返回文章列表
                </Link>
              </div>
            </footer>
          </div>
        </div>
      </article>
    </SectionContainer>
  )
}
