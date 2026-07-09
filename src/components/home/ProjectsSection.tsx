import { featuredProjects } from '@/data/homeData'
import { ArrowUpRight, Cards, FigmaLogo, Notebook, Stack, Toolbox } from '@/components/icons'

const toneMap = {
  rose: {
    icon: 'bg-rose-500 text-white',
    tag: 'bg-rose-100 text-rose-700',
  },
  emerald: {
    icon: 'bg-emerald-500 text-white',
    tag: 'bg-emerald-100 text-emerald-700',
  },
  violet: {
    icon: 'bg-violet-500 text-white',
    tag: 'bg-violet-100 text-violet-700',
  },
  yellow: {
    icon: 'bg-yellow-500 text-white',
    tag: 'bg-yellow-100 text-yellow-700',
  },
}

function ProjectIcon({ icon }: { icon: string }) {
  if (icon === 'cards') return <Cards size={28} />
  if (icon === 'notebook') return <Notebook size={28} />
  if (icon === 'toolbox') return <Toolbox size={28} />
  return <FigmaLogo size={28} />
}

export default function ProjectsSection() {
  return (
    <section id="projects" className="bg-skin-surface py-12">
      <div className="mx-auto max-w-site px-6">
        <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full border border-skin-dark bg-skin-card text-3xl">
              <Stack size={28} />
            </div>
            <div>
              <h2 className="text-3xl font-black">我的项目</h2>
              <p className="mt-1 text-skin-muted">正在维护的产品</p>
            </div>
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          {featuredProjects.map((project) => {
            const tone = toneMap[project.tone]
            return (
              <a
                key={project.title}
                href={project.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex flex-col rounded-2xl border border-skin-border bg-skin-card p-6 transition hover:shadow-soft"
              >
                <div className="flex items-center justify-between">
                  <div
                    className={`flex h-14 w-14 items-center justify-center rounded-2xl text-3xl ${tone.icon}`}
                  >
                    <ProjectIcon icon={project.icon} />
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-bold ${tone.tag}`}>
                    {project.tag}
                  </span>
                </div>
                <h3 className="mt-5 text-lg font-black">{project.title}</h3>
                <p className="mt-2 flex-1 text-sm leading-6 text-skin-muted">
                  {project.description}
                </p>
                <span className="mt-5 flex items-center gap-2 font-semibold">
                  访问项目
                  <ArrowUpRight size={18} className="transition group-hover:translate-x-0.5" />
                </span>
              </a>
            )
          })}
        </div>
      </div>
    </section>
  )
}
