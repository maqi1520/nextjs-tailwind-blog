import React, { ReactElement, useEffect, useState } from 'react';
import Link from 'next/link';
import { email, github, name } from '../../config';
import { useMe } from '../../hooks';
import Icon from '../Icon';

interface Props {
  children: ReactElement;
}
export default function Header({ children }: Props): ReactElement {
  const { user } = useMe();
  const [current, setCurrent] = useState('');
  const pickTheme = (theme) => {
    if (theme === current) return;
    document.documentElement.classList.add(theme);
    localStorage.setItem('skin', theme);
    document.documentElement.classList.remove(current);
    setCurrent(theme);
  };
  useEffect(() => {
    const skin = localStorage.getItem('skin');
    if (skin) {
      setCurrent(skin);
    }
  }, []);
  return (
    <header
      id="header"
      className="relative top-0 z-50 right-0 left-0 bg-skin-off-base shadow"
    >
      <div className="mx-auto lg:max-w-4xl md:max-w-3xl h-16 flex justify-between items-center">
        <div className="flex-shrink-0 mr-24">
          <Link href="/">
            <a className="flex items-center">
              <span className="text-3xl font-extrabold mr-2">M</span>
              <span>{name}</span>
            </a>
          </Link>
        </div>
        <nav className="flex-1 flex items-center">{children}</nav>
        <div className="flex-1 flex items-center justify-end ml-10 space-x-3">
          <span
            aria-label="换肤"
            className="transition-colors hover:text-skin-primary relative group pl-2"
          >
            <Icon type="skin" />
            <div className="flex -space-x-2 transition-all absolute right-0 top-0 opacity-0 group-hover:opacity-100 group-hover:right-6">
              <div
                onClick={() => pickTheme('theme-light')}
                className="h-6 w-6 rounded-full border bg-white"
              ></div>
              <div
                onClick={() => pickTheme('theme-dark')}
                className="h-6 w-6 rounded-full border bg-black"
              ></div>
              <div
                onClick={() => pickTheme('theme-solar')}
                className="h-6 w-6 rounded-full border bg-red-500"
              ></div>
              <div
                onClick={() => pickTheme('theme-evergreen')}
                className="h-6 w-6 rounded-full border bg-green-600"
              ></div>
            </div>
          </span>
          <a href={github} rel="noreferrer" target="_blank">
            <Icon type="github" />
          </a>
          <a href={`mailto:${email}`} rel="noreferrer" target="_blank">
            <Icon type="email" />
          </a>
          {user ? (
            <Link href="/admin">
              <a>{user.email}</a>
            </Link>
          ) : (
            <Link href="/login">
              <a>
                <button className="btn">登录</button>
              </a>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
