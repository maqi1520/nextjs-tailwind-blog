import fs from 'fs'
import http from 'http'
import res from './search.json'

export type VItem = {
  bvid: string
  pic: string
  title: string
  length: string
  play: number
  comment: number
}

interface JSONResponse {
  data: {
    list: {
      vlist: VItem[]
    }
  }
}

function download(url: string) {
  const items = url.split('/')
  return new Promise<string>((resolve) => {
    http.get(url + '@640w_400h', (res) => {
      const path = `./public/static/images/video/${items[items.length - 1]}`
      const filePath = fs.createWriteStream(path)
      res.pipe(filePath)
      filePath.on('finish', () => {
        filePath.close()
        resolve(items[items.length - 1])
      })
    })
  })
}

export async function getVideos() {
  const videos = res.data.list.vlist

  for (let index = 0; index < videos.length; index++) {
    const vitem = videos[index]
    const pic = await download(vitem.pic)
    vitem.pic = pic
  }

  return videos
}
