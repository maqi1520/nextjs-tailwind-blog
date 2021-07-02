import Head from 'next/head';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import { title } from '../../../config';
import { getLayout } from '../../../components/AdminLayout';
import { useForm } from 'react-hook-form';
import cl from 'classnames';

import { Project } from '@prisma/client';
import {
  getProject,
  createProject,
  updateProject,
} from '../../../lib/services';

interface Tstate extends Partial<Project> {}

const fields = [
  {
    name: '标题',
    code: 'title',
    type: 'text',
    required: true,
  },
  {
    name: '描述',
    code: 'description',
    type: 'textarea',
    required: true,
  },
  {
    name: '仓库地址',
    code: 'repoUrl',
    type: 'text',
    required: true,
  },
  {
    name: '项目地址',
    code: 'repoUrl',
    type: 'text',
    required: false,
  },
  {
    name: '排序',
    type: 'number',
    required: false,
  },
];

export default function CreatePage() {
  const router = useRouter();
  const { id } = router.query;

  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, errors, reset } = useForm<Tstate>({
    defaultValues: {},
  });
  useEffect(() => {
    if (id) {
      getProject(+id).then((res) => {
        reset(res);
      });
    }
  }, [id, reset]);
  const history = useRouter();
  const onSubmit = async (data: Tstate) => {
    true;
    setLoading(true);
    const res = id ? await updateProject(+id, data) : await createProject(data);
    if (res.success) {
      history.push('/admin/project');
    } else {
      alert(res.message);
    }
    setLoading(false);
  };
  return (
    <div>
      <Head>
        <title>新建项目-{title}</title>
      </Head>
      <div className="mt-6 max-w-2xl mx-auto">
        <form onSubmit={handleSubmit(onSubmit)}>
          {fields.map((field) => (
            <div className="mb-4" key={field.code}>
              <label className="block text-sm font-medium leading-5 ">
                {field.name}
              </label>
              <div className="mt-1">
                {field.type === 'textarea' ? (
                  <textarea
                    rows={5}
                    className={
                      errors[field.code] ? 'border-skin-secondary' : ''
                    }
                    name={field.code}
                    ref={register({
                      required: field.required,
                    })}
                  />
                ) : (
                  <input
                    className={
                      errors[field.code] ? 'border-skin-secondary' : ''
                    }
                    name={field.code}
                    type={field.type}
                    ref={register({
                      required: field.required,
                    })}
                  />
                )}
              </div>

              {errors[field.code]?.type === 'required' && (
                <div className="mt-1">{field.name} is required</div>
              )}
            </div>
          ))}

          <div className="pt-2">
            <button
              disabled={loading}
              type="submit"
              className={cl('btn w-full btn-primary btn-lg', {
                'opacity-50': loading,
              })}
            >
              {loading ? 'loading' : '保存'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

CreatePage.getLayout = getLayout;
