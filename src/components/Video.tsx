import React from 'react'

type Props = {
  src: string
}

export default function Video({ src }: Props) {
  return (
    <iframe
      src={src}
      scrolling="no"
      className="aspect-video w-full"
      frameBorder="no"
      allowFullScreen
    ></iframe>
  )
}
