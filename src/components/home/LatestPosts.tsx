import Link from '@/components/Link'
import PostCard from '@/components/home/PostCard'
import { PostFrontMatter } from 'types/PostFrontMatter'
import { ArrowRight } from '@/components/icons'

type Props = {
  posts: PostFrontMatter[]
}

export default function LatestPosts({ posts }: Props) {
  return (
    <section className="bg-skin-surface py-16">
      <div className="mx-auto max-w-site px-6">
        <div className="mb-8 flex items-center justify-between">
          <h2 className="text-2xl font-black">最新博客列表</h2>
          <Link href="/blog" className="flex items-center gap-2 font-semibold">
            查看全部文章
            <ArrowRight size={18} />
          </Link>
        </div>

        {!posts.length ? (
          <p className="text-skin-muted">暂无数据</p>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post, index) => (
              <PostCard key={post.slug} post={post} index={index} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
