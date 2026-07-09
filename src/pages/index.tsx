import { PageSEO } from '@/components/SEO'
import siteMetadata from '@/data/siteMetadata'
import { getAllFilesFrontMatter } from '@/lib/mdx'
import { GetStaticProps, InferGetStaticPropsType } from 'next'
import { PostFrontMatter } from 'types/PostFrontMatter'
import HomeHero from '@/components/home/HomeHero'
import MetricsSection from '@/components/home/MetricsSection'
import LatestPosts from '@/components/home/LatestPosts'
import ServicesSection from '@/components/home/ServicesSection'
import ProjectsSection from '@/components/home/ProjectsSection'
import ContactSection from '@/components/home/ContactSection'

const MAX_DISPLAY = 6

export const getStaticProps: GetStaticProps<{ posts: PostFrontMatter[] }> = async () => {
  const allPosts = await getAllFilesFrontMatter('blog')
  const posts = allPosts
    .filter((post) => !post.slug.startsWith('mp/') && !post.slug.startsWith('mp-article/'))
    .slice(0, MAX_DISPLAY)

  return { props: { posts } }
}

export default function Home({ posts }: InferGetStaticPropsType<typeof getStaticProps>) {
  return (
    <>
      <PageSEO title={siteMetadata.title} description={siteMetadata.description} />
      <HomeHero />
      <MetricsSection />
      <LatestPosts posts={posts} />
      <div className="space-y-12 bg-skin-surface pb-12">
        <ServicesSection />
        <ProjectsSection />
        <ContactSection />
      </div>
    </>
  )
}
