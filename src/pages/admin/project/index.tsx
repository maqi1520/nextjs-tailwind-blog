import React, { ReactElement } from 'react';
import Pagination from '../../../components/Pagination';
import ProjectCard from '../../../components/ProjectCard';
import Section from '../../../components/Section';
import { getLayout } from '../../../components/AdminLayout';
import { useProject } from '../../../hooks';
import Link from 'next/link';
import { useRouter } from 'next/router';

interface Props {}

export default function ProjectPage({}: Props): ReactElement {
  const router = useRouter();
  const { pageNum = 1, pageSize = 20 } = router.query;

  const { data: res, mutate } = useProject(+pageNum, +pageSize);

  console.log(res);

  const { data, total } = res || { data: [], total: 0 };

  const handlePageChange = (current: number, pageSize: number) => {
    router.push({
      pathname: '/admin/project',
      query: {
        pageSize,
        pageNum: current,
      },
    });
  };
  const AddButton = (
    <Link href="/admin/project/create">
      <a>
        <button className="btn btn-primary">新增</button>
      </a>
    </Link>
  );

  return (
    <div>
      <Section extra={AddButton} title="项目管理" id="project">
        <ul className="flex flex-col mt-20 space-y-12">
          {data.map((project) => (
            <li key={project.id}>
              <ProjectCard reload={mutate} editable project={project} />
            </li>
          ))}
        </ul>
      </Section>
      <Pagination
        pageSize={+pageSize}
        onChange={handlePageChange}
        current={+pageNum}
        total={total}
      />
    </div>
  );
}

ProjectPage.getLayout = getLayout;
