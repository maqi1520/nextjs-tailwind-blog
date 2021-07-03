import Head from 'next/head';
import { useRouter } from 'next/router';
import { Editor } from '@bytemd/react';
import locale from 'bytemd/lib/locales/zh_Hans.json';
import footnotes from '@bytemd/plugin-footnotes';
import frontmatter from '@bytemd/plugin-frontmatter';
import gfm from '@bytemd/plugin-gfm';
import plugin_gfm from '@bytemd/plugin-gfm/lib/locales/zh_Hans.json';
import highlight from '@bytemd/plugin-highlight-ssr';
import math from '@bytemd/plugin-math';
import plugin_math from '@bytemd/plugin-math/lib/locales/zh_Hans.json';
import mediumZoom from '@bytemd/plugin-medium-zoom';
import mermaid from '@bytemd/plugin-mermaid';
import plugin_mermaid from '@bytemd/plugin-mermaid/lib/locales/zh_Hans.json';
import gemoji from '@bytemd/plugin-gemoji';
import { useMemo, useState, useCallback, useEffect } from 'react';
import { title } from '../../../config';
import TagPanel from '../../../components/TagPanel';
import DropDown from '../../../components/DropDown';
import Icon from '../../../components/Icon';

import type { Post, Category } from '@prisma/client';
import { getPost, createPost, updatePost } from '../../../lib/services';

interface Tstate extends Partial<Post> {
  categories: Category[];
}

export default function Home() {
  const plugins = useMemo(
    () => [
      footnotes(),
      frontmatter(),
      gemoji(),
      gfm({ locale: plugin_gfm }),
      highlight(),
      math({
        locale: plugin_math,
        katexOptions: { output: 'html' },
      }),
      mediumZoom(),
      mermaid({
        locale: plugin_mermaid,
      }),
    ],
    []
  );

  const uploadImages = useCallback(async (files) => {
    return [
      {
        title: '1212',
        url: 'http://1212.img',
        alt: '1212',
      },
    ];
  }, []);

  const router = useRouter();
  const { id } = router.query;

  const [data, setArticle] = useState<Tstate>({
    hits: 1,
    title: '',
    content: '',
    categories: [],
  });
  useEffect(() => {
    if (id) {
      getPost(+id).then((res) => {
        setArticle(res);
      });
    }
  }, [id]);

  const setValue = useCallback((content) => {
    setArticle((prev) => ({ ...prev, content }));
  }, []);
  const setTitle = useCallback((title) => {
    setArticle((prev) => ({ ...prev, title }));
  }, []);

  const setCategories = useCallback((categories) => {
    setArticle((prev) => ({ ...prev, categories }));
  }, []);

  const setSummary = useCallback((summary) => {
    setArticle((prev) => ({ ...prev, summary }));
  }, []);

  const handleSave = useCallback(
    async (published: boolean) => {
      if (data.title.trim() === '') {
        return;
      }
      try {
        if (!data.id) {
          const { data: res } = await createPost({
            ...data,
            published: Number(published),
          });
          if (res) {
            router.back();
          }
        } else {
          const { data: res } = await updatePost(data.id, {
            ...data,
            published: Number(published),
          });
          if (res) {
            router.back();
          }
        }
      } catch (error) {
        console.error(error.message);
      }
    },
    [router, data]
  );

  const popContent = (
    <div style={{ width: 300 }}>
      <textarea
        placeholder="摘要"
        rows={4}
        value={data.summary}
        onChange={(e) => setSummary(e.target.value)}
      />
      <TagPanel selectedTags={data.categories} onChange={setCategories} />
      <div className="border-t my-2"></div>
      <div className="flex space-x-4">
        <button className="btn flex-1" onClick={() => handleSave(false)}>
          保存草稿
        </button>
        <button
          className="btn btn-primary flex-1"
          onClick={() => handleSave(true)}
        >
          <Icon className="w-5 h-5 inline-block" type="save" />
          <span className="ml-2">确认发布</span>
        </button>
      </div>
    </div>
  );

  return (
    <div>
      <Head>
        <title>写文章-{title}</title>
      </Head>
      <div className="flex flex-col h-screen custom-admin-preview">
        <div className="flex h-16 px-2 py-3 bg-skin-off-base">
          <input
            value={data.title}
            onChange={(e) => setTitle(e.target.value)}
            className="flex-auto mx-2"
            type="text"
          />
          <DropDown content={popContent}>
            <button className="btn btn-primary w-20">发布</button>
          </DropDown>
        </div>

        <Editor
          uploadImages={uploadImages}
          locale={locale}
          value={data.content}
          plugins={plugins}
          onChange={(v) => {
            setValue(v);
          }}
        />
      </div>

      <style jsx global>{`
        .bytemd {
          height: calc(100vh - 64px);
        }
      `}</style>
    </div>
  );
}
