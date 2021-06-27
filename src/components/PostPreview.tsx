import * as React from 'react';
import Link from 'next/link';
import { Post } from '@prisma/client';

interface Props {
  editable?: boolean;
  post: Post;
}

export default function PostPreview({ post, editable }: Props) {
  return (
    <Link href={editable ? `/admin/blog/${post.id}` : `/blog/${post.id}`}>
      <a>
        <article className="text-skin-base relative flex items-center transition-transform transform group hover:-translate-x-2">
          <div className="flex flex-col flex-grow py-8 space-y-4 text-base rounded sm:px-8 sm:shadow-md bg-skin-off-base">
            <div className="flex flex-col justify-between space-y-2 md:space-y-0 md:flex-row md:items-baseline">
              <h3 className="text-xl font-bold tracking-wider">{post.title}</h3>
              <span className="text-skin-muted">
                {new Date(post.createdAt).toLocaleDateString()}
              </span>
            </div>
            <p className="max-w-3xl leading-8 text-xs text-skin-muted">
              {post.summary}
            </p>
          </div>
          <span className="absolute transition opacity-0 group-hover:opacity-100 -right-8">
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
                d="M13 9l3 3m0 0l-3 3m3-3H8m13 0a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </span>
        </article>
      </a>
    </Link>
  );
}
