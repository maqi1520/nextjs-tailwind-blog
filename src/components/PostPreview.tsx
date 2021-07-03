import * as React from 'react';
import Link from 'next/link';
import { Post, Category } from '@prisma/client';
import Tag from './TagPanel/Tag';
import Icon from '../components/Icon';
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
                  <Icon type="delete" />
                </button>
              ) : null}
            </div>
          </div>
          <span className="absolute transition opacity-0 group-hover:opacity-100 -right-8">
            <Icon className="w-6 h-6" type="arrow-right" />
          </span>
        </article>
      </a>
    </Link>
  );
}
