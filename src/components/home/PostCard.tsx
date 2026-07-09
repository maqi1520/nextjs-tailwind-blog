import Link from '@/components/Link'
import { AVATAR_TONES, TAG_TONES } from '@/data/homeData'
import formatDate from '@/lib/utils/formatDate'
import { PostFrontMatter } from 'types/PostFrontMatter'
import { CalendarBlank } from '@/components/icons'

type Props = {
  post: PostFrontMatter
  index: number
}

function estimateReadingMinutes(summary?: string) {
  const length = summary?.length || 0
  return Math.max(3, Math.round(length / 180) || 5)
}

export default function PostCard({ post, index }: Props) {
  const tag = post.tags?.[0] || '博客'
  const tagTone = TAG_TONES[index % TAG_TONES.length]
  const avatarTone = AVATAR_TONES[index % AVATAR_TONES.length]
  const initial = (post.title || '博').trim().charAt(0).toUpperCase()
  const minutes = estimateReadingMinutes(post.summary)

  return (
    <article className="rounded-2xl border border-skin-border bg-skin-card p-6 transition hover:shadow-soft">
      <span className={`rounded-full px-3 py-1 text-xs font-bold ${tagTone}`}>{tag}</span>
      <Link href={`/blog/${post.slug}`} className="mt-6 flex gap-5">
        <div
          className={`serif flex h-14 w-14 shrink-0 items-center justify-center rounded-full text-2xl ${avatarTone}`}
        >
          {initial}
        </div>
        <div>
          <h3 className="text-lg font-black leading-snug">{post.title}</h3>
          {post.summary ? (
            <p
              className="mt-3 overflow-hidden text-sm leading-6 text-skin-muted"
              style={{ display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' }}
            >
              {post.summary}
            </p>
          ) : null}
        </div>
      </Link>
      <div className="mt-6 flex gap-4 text-sm text-black/55">
        <span className="inline-flex items-center gap-1">
          <CalendarBlank size={16} />
          <time dateTime={post.date}>{formatDate(post.date)}</time>
        </span>
        <span>{minutes} 分钟阅读</span>
      </div>
    </article>
  )
}
