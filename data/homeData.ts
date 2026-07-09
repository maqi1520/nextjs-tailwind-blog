export const THEME_OPTIONS = [
  { key: 'sage', label: '青绿', swatch: '#c8dea5' },
  { key: 'cream', label: '奶油', swatch: '#ead7b7' },
  { key: 'blue', label: '蓝灰', swatch: '#cfe3f5' },
  { key: 'mint', label: '薄荷', swatch: '#bfe8d4' },
  { key: 'purple', label: '紫雾', swatch: '#dcd0f3' },
  { key: 'mono', label: '黑白', swatch: '#e5e5dc' },
] as const

export type ThemeKey = (typeof THEME_OPTIONS)[number]['key']

export const DEFAULT_THEME: ThemeKey = 'sage'
export const THEME_STORAGE_KEY = 'blog-theme'

export const heroContent = {
  eyebrow: '独立开发者 / 技术写作者',
  title: '狂奔滴小马',
  roles: '全栈工程师｜独立开发者｜AI coding 爱好者',
  description:
    '如果您对我的技术栈（如 Next.js 全栈开发、Markdown 知识卡片工具，或者云服务器部署）感兴趣，我可以为您提供相关的学习路线或技术方案。',
}

export const heroStats = [
  { value: '200+', label: '技术文章', hint: '深度原创干货' },
  { value: '20+', label: '开源项目', hint: '持续迭代维护' },
  { value: '1168K+', label: '累计阅读', hint: '来自读者的认可' },
]

export const metrics = {
  eyebrow: '创作与实践',
  title: '博客、项目、视频与合作，覆盖的是完整创作与技术实践',
  items: [
    { value: '10年+', label: '前端经验' },
    { value: '30+', label: '教程视频' },
    { value: '6K+', label: 'GitHub Stars' },
    { value: '10+', label: '常用技术栈' },
    { value: '100+', label: '发布内容' },
  ],
}

export const services = {
  title: '合作方式',
  notice: '精力有限，不提供免费咨询，敬请谅解。',
  items: [
    {
      title: '咨询服务',
      description: '一对一深度技术咨询，按小时计费。',
      price: '￥500',
      unit: '/ 小时',
      icon: 'chat',
      accent: 'accent' as const,
    },
    {
      title: '企业培训',
      description: '面向团队的定制化技术培训，按场次计费。',
      price: '￥2000',
      unit: '/ 场次',
      icon: 'presentation',
      accent: 'accent2' as const,
    },
  ],
}

export const featuredProjects = [
  {
    title: 'MD2Card',
    description: '把 Markdown 一键变成小红书 / 公众号 / 抖音可用的知识卡片。',
    href: 'https://md2card.com/',
    tag: '内容工具',
    icon: 'cards',
    tone: 'rose' as const,
  },
  {
    title: 'MDX Notes',
    description: '跨平台笔记软件、公众号排版编辑器，使用 MDX 来排版，提供 Web 版。',
    href: 'https://mdxnotes.com/',
    tag: '开源',
    icon: 'notebook',
    tone: 'emerald' as const,
  },
  {
    title: 'Vibe Design',
    description: '将创意转化为可编辑的 Figma 设计，AI 与 HTML 一键转 Figma 图层。',
    href: 'https://vibe2design.com/zh',
    tag: 'AI 设计',
    icon: 'figma',
    tone: 'violet' as const,
  },
  {
    title: '前端工具箱',
    description: '一站式前端开发工具集合，提升您的开发效率',
    href: 'https://www.runjs.cool/',
    tag: '开源',
    icon: 'toolbox',
    tone: 'yellow' as const,
  },
]

export const contactContent = {
  title: '联系我',
  headline: '用一次深度对话开启合作',
  description: '从需求到产品，把关键问题一次讲清楚。',
  capabilities: [
    { label: '需求梳理', icon: 'chat' },
    { label: '方案设计', icon: 'lightbulb' },
    { label: '技术落地', icon: 'code' },
    { label: '持续迭代', icon: 'rocket' },
  ],
  wechat: 'maqi1520',
  qrHint: '期待与你交流，备注来意',
  qrImage: '/static/images/wechat-qr.png',
}

export const friendLinks = []

export const TAG_TONES = [
  'bg-blue-100 text-blue-700',
  'bg-green-100 text-green-700',
  'bg-purple-100 text-purple-700',
  'bg-sky-100 text-sky-700',
  'bg-orange-100 text-orange-700',
  'bg-teal-100 text-teal-700',
  'bg-rose-100 text-rose-700',
  'bg-amber-100 text-amber-700',
]

export const AVATAR_TONES = [
  'bg-black text-white',
  'bg-emerald-500 text-white',
  'bg-blue-500 text-white',
  'bg-violet-500 text-white',
  'bg-rose-500 text-white',
  'bg-teal-500 text-white',
  'bg-orange-500 text-white',
]
