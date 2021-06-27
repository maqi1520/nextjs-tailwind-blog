import React, { ReactElement } from 'react';
import PostPreview from '../../../components/PostPreview';
import Section from '../../../components/Section';
import { useAsync } from 'react-use';
import axios from 'axios';
import Link from 'next/link';

interface Props {}

export default function BlogPage({}: Props): ReactElement {
  const { value, loading } = useAsync(async () => {
    const res = await axios.get('/api/post');
    return res.data;
  }, []);
  const { data, count } = value || { data: [], res: 0 };

  const AddButton = (
    <Link href="/admin/blog/create">
      <a>
        <button className="btn btn-primary">写文章</button>
      </a>
    </Link>
  );

  return (
    <div>
      <Section extra={AddButton} title="全部文章" id="blog">
        <ul className="flex flex-col mt-20 space-y-12">
          {data.map((post) => (
            <li key={post.id}>
              <PostPreview editable post={post} />
            </li>
          ))}
        </ul>
      </Section>
    </div>
  );
}
