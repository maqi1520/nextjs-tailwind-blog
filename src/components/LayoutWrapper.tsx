import { ReactNode } from 'react'
import SiteHeader from './SiteHeader'
import SiteFooter from './SiteFooter'

interface Props {
  children: ReactNode
}

const LayoutWrapper = ({ children }: Props) => {
  return (
    <div className="flex min-h-screen flex-col bg-skin-bg text-skin-text">
      <SiteHeader />
      <main className="mb-auto w-full flex-1">{children}</main>
      <SiteFooter />
    </div>
  )
}

export default LayoutWrapper
