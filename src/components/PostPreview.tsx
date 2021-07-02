import * as React from 'react';
import Link from 'next/link';
import { Post, Category } from '@prisma/client';
import Tag from './TagPanel/Tag';
import { deletePost } from '../lib/services';

interface Props {
  editable?: boolean;
  reload?: () => void;
  post: Post & { categories: Category[] };
}

export default function PostPreview({ post, editable, reload }: Props) {
  const handleDelete = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (window.confirm('确认删除吗?')) {
      deletePost(post.id).then(() => {
        reload();
      });
    }
  };

  return (
    <Link href={editable ? `/admin/blog/${post.id}` : `/blog/${post.id}`}>
      <a>
        <article className="text-skin-base relative flex items-center transition-transform transform group hover:-translate-x-2">
          <div className="flex flex-col flex-grow p-4 space-y-4 text-base rounded md:p-8 shadow-md bg-skin-off-base">
            <div className="flex flex-col justify-between space-y-2 md:space-y-0 md:flex-row md:items-baseline">
              <h3 className="text-xl font-bold tracking-wider">{post.title}</h3>
              <span className="text-skin-muted">
                {new Date(post.createdAt).toLocaleDateString()}
              </span>
            </div>
            <p className="max-w-3xl leading-8 text-xs text-skin-muted">
              {post.summary}
            </p>
            <div>
              {post.categories.map((tag) => (
                <Tag key={tag.id}>{tag.name}</Tag>
              ))}
              {editable ? (
                <button
                  onClick={handleDelete}
                  className="btn text-skin-secondary"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
              ) : null}
            </div>
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
