import { PageSEO } from '@/components/SEO'
import siteMetadata from '@/data/siteMetadata'
// import { getVideos, VItem } from '@/lib/video'
import Image from 'next/image'
import { GetStaticProps, InferGetStaticPropsType } from 'next'

// export const getStaticProps: GetStaticProps<{ videos: VItem[] }> = async () => {
//   const videos = await getVideos()
//   console.log(videos)
//   return { props: { videos: JSON.parse(JSON.stringify(videos)) } }
// }

export default function Vodeo({ videos }: InferGetStaticPropsType<typeof getStaticProps>) {
  return (
    <>
      <PageSEO title={`视频 - ${siteMetadata.author}`} description="我的B站视频" />
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        <div className="space-y-2 pt-6 pb-8 md:space-y-5">
          <h1 className="text-3xl font-extrabold leading-9 tracking-tight text-gray-900 dark:text-gray-100 sm:text-4xl sm:leading-10 md:text-6xl md:leading-14">
            我的视频
          </h1>
          <p className="text-lg leading-7 text-gray-500 dark:text-gray-400">我的B站视频</p>
        </div>

        <div className="container py-12">
          <section className="grid grid-cols-1 gap-10 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {/* {videos.map((v) => (
              <article
                key={v.bvid}
                className="group mx-auto w-full max-w-md transform cursor-pointer rounded-b-xl shadow-xl duration-500 hover:-translate-y-2"
              >
              </article>
            ))} */}
          </section>
        </div>
      </div>
    </>
  )
}
