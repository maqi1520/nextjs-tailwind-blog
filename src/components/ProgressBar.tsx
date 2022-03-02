import React from 'react'

import { useEffect, useState } from 'react'

export function useReadingProgress() {
  const [progress, setProgress] = useState(0)
  useEffect(() => {
    function updateScroll() {
      // 已经滚动的高度
      const currentScrollY = window.scrollY
      // 可以滚动的高度
      let scrollHeight = document.body.scrollHeight - window.innerHeight
      if (scrollHeight) {
        setProgress(Number((currentScrollY / scrollHeight).toFixed(2)) * 100)
      }
    }
    // 添加全局滚动事件的监听
    window.addEventListener('scroll', updateScroll)

    // 移除监听
    return () => {
      window.removeEventListener('scroll', updateScroll)
    }
  }, [])
  return progress
}

export default function ProgressBar() {
  const progress = useReadingProgress()
  return (
    <div
      style={{
        transform: `translateX(${progress - 100}%)`,
      }}
      className="fixed top-0 left-0 h-1 w-full bg-primary-500 backdrop-blur-3xl transition-transform duration-150"
    />
  )
}
