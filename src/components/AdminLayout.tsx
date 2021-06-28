import React, { ReactElement } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useMe } from '../hooks';

interface Props {
  children: ReactElement;
}

export default function AdminLayout({ children }: Props): ReactElement {
  const router = useRouter();
  const { user, loading, signOut } = useMe();
  const handleLogout = () => {
    signOut().then(() => {
      router.replace('/');
    });
  };
  if (!user && !loading) {
    return (
      <section
        key="no"
        className="h-screen flex flex-col justify-center items-center"
      >
        <p>暂无权限，请先登录</p>
        <Link href="/login">
          <a>
            <button className="btn btn-primary mt-5">登录</button>
          </a>
        </Link>
      </section>
    );
  }
  return (
    <div key="1" className="flex p-4 h-screen">
      <div className="py-4 bg-skin-off-base rounded-lg w-52 flex-shrink-0 flex flex-col justify-between">
        <ul className="space-y-8 text-sm">
          <li className="text-2xl border-b p-4 flex items-center">
            <Link href="/">
              <a>
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
                    d="M11 15l-3-3m0 0l3-3m-3 3h8M3 12a9 9 0 1118 0 9 9 0 01-18 0z"
                  />
                </svg>
              </a>
            </Link>

            <Link href="/admin">
              <a className="ml-2">管理后台</a>
            </Link>
          </li>
          <li>
            <Link href="/admin/blog">
              <a className="flex items-center">
                <div className="bg-skin-base rounded-lg inline-block p-2 ml-4 mr-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    className="block w-4 h-4  stroke-current"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    ></path>
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    ></path>
                  </svg>
                </div>
                博客管理
              </a>
            </Link>
          </li>
          <li>
            <Link href="/admin/project">
              <a className="flex items-center">
                <div className="bg-skin-primary rounded-lg inline-block p-2 ml-4 mr-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    className="block w-4 h-4 stroke-current"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
                    ></path>
                  </svg>
                </div>
                项目管理
              </a>
            </Link>
          </li>
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
