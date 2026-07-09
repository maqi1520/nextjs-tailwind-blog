import Link from '@/components/Link'
import SectionContainer from '@/components/SectionContainer'

export default function FourZeroFour() {
  return (
    <SectionContainer>
      <div className="flex flex-col items-start justify-start py-8 md:mt-24 md:flex-row md:items-center md:justify-center md:space-x-6">
        <div className="space-x-2 pb-8 pt-6 md:space-y-5">
          <h1 className="text-6xl font-extrabold leading-9 tracking-tight text-gray-900 md:border-r-2 md:px-6 md:text-8xl md:leading-14">
            404
          </h1>
        </div>
        <div className="max-w-md">
          <p className="mb-4 text-xl font-bold leading-normal md:text-2xl">
            抱歉，这个页面暂时没找到
          </p>
          <p className="mb-8">别急，您可以可以返回首页找找！</p>
          <Link href="/">
            <button className="focus:shadow-outline-blue inline rounded-lg border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium leading-5 text-white shadow transition-colors duration-150 hover:bg-blue-700 focus:outline-none">
              返回主页
            </button>
          </Link>
        </div>
      </div>
    </SectionContainer>
  )
}
