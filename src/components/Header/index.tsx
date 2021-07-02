import React, { ReactElement } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Base from './Base';

interface Props {}

export default function Header({}: Props): ReactElement {
  const scrollTo =
    (id: string) => (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
      e.preventDefault();
      const dom = document.querySelector(id);
      if (dom) {
        dom.scrollIntoView({
          behavior: 'smooth',
          block: 'end',
          inline: 'nearest',
        });
      }
    };
  const router = useRouter();
  let Nav;
  if (router.pathname === '/') {
    Nav = (
      <div className="space-x-8">
        <a className="cursor-pointer" onClick={scrollTo('#project')}>
          项目
        </a>
        <a className="cursor-pointer" onClick={scrollTo('#blog')}>
          博客
        </a>
        <a className="cursor-pointer" onClick={scrollTo('#about')}>
          关于
        </a>
      </div>
    );
  } else {
    Nav = (
      <div className="space-x-8">
        <Link href="/blog">
          <a>博客</a>
        </Link>
      </div>
    );
  }
  return <Base>{Nav}</Base>;
}
