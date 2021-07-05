import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/router';
import cl from 'classnames';
import Link from 'next/link';

import Icon from '../../components/Icon';
import { SigninData, signin } from '../../lib/services';

export default function Login() {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, errors } = useForm<SigninData>({
    defaultValues: {
      email: 'admin@admin.com',
      password: '123456',
    },
  });
  const history = useRouter();
  const onSubmit = async (data: SigninData) => {
    setLoading(true);
    const res = await signin<{ success: boolean; message?: string }>(data);
    if (res.success) {
      history.push('/admin');
    } else {
      setError(res.message);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex justify-center items-center">
      <div className="mx-auto w-full max-w-sm bg-skin-off-base p-10 shadow-lg">
        <h2 className="mt-2 text-3xl leading-9 font-extrabold text-skin-primary">
          登录
        </h2>

        <div className="mt-8">
          {error && (
            <div className="py-2 px-3 text-sm border border-red-500 text-red-500 bg-red-100 flex justify-between items-center">
              <span>{error}</span>
              <Icon
                className="cursor-pointer w-5 h-5"
                onClick={() => setError('')}
                type="close"
              />
            </div>
          )}
          <div className="mt-6">
            <form onSubmit={handleSubmit(onSubmit)}>
              <div>
                <label className="block text-sm font-medium leading-5 ">
                  Email
                </label>
                <div className="mt-1">
                  <input
                    className={errors.email ? 'border-skin-secondary' : ''}
                    name="email"
                    type="text"
                    ref={register({
                      required: true,
                      pattern: new RegExp('.+@.+..+'),
                    })}
                  />
                </div>
              </div>
              {errors.email?.type === 'required' && (
                <div className="mt-1">Email is required</div>
              )}
              {errors.email?.type === 'pattern' && (
                <div className="mt-1">Email error</div>
              )}

              <div className="mt-6">
                <label className="block text-sm font-medium leading-5 ">
                  Password
                </label>
                <div className="mt-1">
                  <input
                    className={errors.password ? 'border-skin-secondary' : ''}
                    name="password"
                    type="password"
                    ref={register({
                      required: true,
                      minLength: 6,
                      maxLength: 20,
                    })}
                  />
                </div>
              </div>
              {errors.password && (
                <div className="mt-1">Password is required</div>
              )}

              <div className="mt-6 flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    name="remember_me"
                    type="checkbox"
                    ref={register}
                    className=""
                  />
                  <label
                    htmlFor="remember_me"
                    className="ml-2 block text-sm leading-5"
                  >
                    记住密码
                  </label>
                </div>

                <div className="text-sm leading-5">
                  <a
                    href="#"
                    className="font-medium text-skin-primary focus:outline-none focus:underline transition ease-in-out duration-150"
                  >
                    忘记密码?
                  </a>
                </div>
              </div>

              <div className="mt-6">
                <button
                  disabled={loading}
                  type="submit"
                  className={cl('btn w-full btn-primary btn-lg', {
                    'opacity-50': loading,
                  })}
                >
                  {loading ? 'loading' : '登录'}
                </button>
              </div>

              <div className="mt-6">
                还没有账号？去
                <Link href="/register">
                  <a className="text-skin-primary">注册</a>
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
