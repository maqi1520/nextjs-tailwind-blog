/* eslint-disable react/jsx-no-target-blank */
import Link from 'next/link';
import { Project } from '@prisma/client';
import { deleteProject } from '../lib/services';
import Icon from '../components/Icon';
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
      deleteProject(id).then(() => {
        reload();
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
            <Icon className="w-5 h-5 inline-block" type="code" /> code
          </a>
        ) : null}
        {editable ? (
          <button onClick={handleDelete} className="btn text-skin-secondary">
            <Icon type="delete" />
          </button>
        ) : null}
      </div>
    </div>
  );
};

export default ProjectCard;
