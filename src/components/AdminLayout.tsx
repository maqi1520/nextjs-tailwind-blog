import Head from 'next/head';
import React, { ReactElement } from 'react';
import cl from 'classnames';
import Link from 'next/link';
import Icon from '../components/Icon';
import { useRouter } from 'next/router';
import { useMe } from '../hooks';
import { signout } from '../lib/services';

interface Props {
  children: ReactElement;
}

export default function AdminLayout({ children }: Props): ReactElement {
  const router = useRouter();
  const { user, loading, mutate } = useMe();
  const handleLogout = () => {
    signout().then(() => {
      mutate(null, false);
      router.replace('/');
    });
  };
  if (loading) {
    return (
      <div className="h-screen flex justify-center items-center">
        <svg
          className="animate-spin h-10 w-10 text-white"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
      </div>
    );
  }
  if (!user) {
    return (
      <section
        key="no"
        className="h-screen flex flex-col justify-center items-center"
      >
        <Head>
          <title>后台管理</title>
        </Head>
        <p>暂无权限，请先登录</p>
        <Link href="/login">
          <a>
            <button className="btn btn-primary mt-5">登录</button>
          </a>
        </Link>
      </section>
    );
  }

  const menus = [
    {
      title: '博客管理',
      pathname: '/admin/blog',
      icon: <Icon type="blog" />,
    },
    {
      title: '项目管理',
      pathname: '/admin/project',
      icon: <Icon type="project" />,
    },
  ];
  return (
    <div className="flex p-4 h-screen">
      <Head>
        <title>后台管理</title>
      </Head>
      <div className="py-4 bg-skin-off-base rounded-lg w-52 flex-shrink-0 flex flex-col justify-between">
        <ul className="space-y-8 text-sm">
          <li className="text-2xl border-b p-4 flex items-center">
            <Link href="/">
              <a>
                <Icon type="back"></Icon>
              </a>
            </Link>

            <Link href="/admin">
              <a className="ml-2">管理后台</a>
            </Link>
          </li>
          {menus.map((menu) => (
            <li key={menu.pathname}>
              <Link href={menu.pathname}>
                <a className="flex items-center">
                  <div
                    className={cl('rounded-lg inline-block p-2 ml-4 mr-4', {
                      'bg-skin-primary text-skin-inverted':
                        router.pathname.includes(menu.pathname),
                    })}
                  >
                    {menu.icon}
                  </div>
                  {menu.title}
                </a>
              </Link>
            </li>
          ))}
        </ul>
        <div className="py-5 border-t">
          <div className="flex justify-center items-center">
            <div className="h-5 w-5 mr-2 rounded-full bg-skin-secondary"></div>
            <span>{user.name || user.email}</span>
          </div>

          <div className="flex justify-center items-center mt-5">
            <button onClick={handleLogout} className="btn">
              退出
            </button>
          </div>
        </div>
      </div>
      <div className="p-4 flex-auto">{children}</div>
    </div>
  );
}

export const getLayout = (page) => <AdminLayout>{page}</AdminLayout>;
