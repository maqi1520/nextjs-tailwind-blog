import { PageSEO } from '@/components/SEO'
import siteMetadata from '@/data/siteMetadata'
import { getVideos, VItem } from '@/lib/video'
import Image from 'next/image'
import { GetStaticProps, InferGetStaticPropsType } from 'next'

export const getStaticProps: GetStaticProps<{ videos: VItem[] }> = async () => {
  const videos = await getVideos()
  console.log(videos)
  return { props: { videos: JSON.parse(JSON.stringify(videos)) } }
}

export default function Video({ videos }: InferGetStaticPropsType<typeof getStaticProps>) {
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
            {videos.map((v) => (
              <article
                key={v.bvid}
                className="group mx-auto w-full max-w-md transform cursor-pointer rounded-b-xl shadow-xl duration-500 hover:-translate-y-2"
              >
                <section className="content relative aspect-video rounded-xl">
                  <a
                    href={`https://www.bilibili.com/video/${v.bvid}/`}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={v.title}
                  >
                    <Image
                      src={'/static/images/video/' + v.pic}
                      width="640"
                      height="420"
                      className="block w-full rounded-t-xl"
                      unoptimized
                      alt=""
                    />
                  </a>
                  <div className="absolute bottom-2 flex w-full bg-black bg-opacity-20 p-2 text-sm  font-bold text-white">
                    <div className="flex w-1/2 items-center">
                      <svg
                        className="mr-2 h-6 w-6"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        ></path>
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        ></path>
                      </svg>
                      <span>{v.play}</span>
                    </div>
                    <div className="flex w-1/2 flex-row-reverse items-center">
                      <svg
                        className="absolute ml-2 h-6 w-6 place-items-end group-hover:animate-ping "
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                        ></path>
                      </svg>
                      <svg
                        className="relative ml-2 h-6 w-6 place-items-end"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                        ></path>
                      </svg>
                      <span className="place-items-end">{v.length}</span>
                    </div>
                  </div>
                </section>
                <h2 className="p-4 text-base font-medium text-gray-400">
                  <a
                    href={`https://www.bilibili.com/video/${v.bvid}/`}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={v.title}
                  >
                    {v.title}
                  </a>
                </h2>
              </article>
            ))}
          </section>
        </div>
      </div>
    </>
  )
}
