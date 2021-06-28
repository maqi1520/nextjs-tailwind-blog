/* eslint-disable react/jsx-no-target-blank */
const ProjectCard = ({ project }) => {
  const { title, description, repoUrl, appUrl } = project;
  return (
    <div className="flex flex-col justify-between py-8 space-y-8 lg:flex-row lg:items-center lg:max-w-[857px]">
      <div className="flex flex-col">
        <h3 className="text-xl font-semibold tracking-wider text-skin-secondary">
          {title}
        </h3>
        <div className="max-w-xl mt-2">{description}</div>
      </div>

      <div className="flex flex-col items-start mt-8 space-y-2 lg:items-end">
        {repoUrl ? (
          <a
            target="_blank"
            href={repoUrl}
            className="flex items-center font-medium transition-colors hover:text-muted-hover"
          >
            源码
          </a>
        ) : null}
        {appUrl ? (
          <a
            target="_blank"
            className="transition-colors text-skin-primary hover:text-skin-secondary"
            href={appUrl}
          >
            查看
          </a>
        ) : null}
      </div>
    </div>
  );
};

export default ProjectCard;
