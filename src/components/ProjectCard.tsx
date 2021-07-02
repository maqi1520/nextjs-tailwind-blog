/* eslint-disable react/jsx-no-target-blank */
import Link from 'next/link';
import { Project } from '@prisma/client';
import { deleteProject } from '../lib/services';
interface Props {
  project: Project;
  editable?: boolean;
  reload?: () => void;
}

const ProjectCard = ({ project, editable, reload }: Props) => {
  const { title, description, repoUrl, appUrl, id } = project;

  const handleDelete = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (window.confirm('确认删除吗?')) {
      deleteProject(id).then(()=>{
        reload()
      });
    }
  };

  return (
    <div className="flex flex-col justify-between py-8 space-y-8 lg:flex-row lg:items-center lg:max-w-[857px]">
      <div className="flex flex-col">
        <h3 className="text-xl font-semibold tracking-wider text-skin-primary">
          {editable ? (
            <Link href={`/admin/project/${id}`}>
              <a>{title}</a>
            </Link>
          ) : (
            <a target="_blank" href={appUrl}>
              {title}
            </a>
          )}
        </h3>
        <div className="max-w-xl mt-2">{description}</div>
      </div>

      <div className="flex flex-col items-start mt-8 space-y-2 lg:items-end">
        {repoUrl ? (
          <a
            target="_blank"
            href={repoUrl}
            className="transition-colors text-skin-primary hover:text-skin-secondary"
          >
            <svg
              className="w-5 h-5 inline-block"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
              />
            </svg>{' '}
            code
          </a>
        ) : null}
        {editable ? (
          <button onClick={handleDelete} className="btn text-skin-secondary">
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </button>
        ) : null}
      </div>
    </div>
  );
};

export default ProjectCard;
