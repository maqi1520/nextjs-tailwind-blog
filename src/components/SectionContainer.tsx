import { ReactNode } from 'react'

interface Props {
  children: ReactNode
  wide?: boolean
}

export default function SectionContainer({ children, wide = false }: Props) {
  return <div className={`mx-auto max-w-site px-6`}>{children}</div>
}
