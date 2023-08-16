import fs from 'fs'
import http from 'http'

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
  return new Promise<string>((reslove) => {
    http.get(url + '@640w_400h', (res) => {
      const path = `./public/static/images/${items[items.length - 1]}`
      const filePath = fs.createWriteStream(path)
      res.pipe(filePath)
      filePath.on('finish', () => {
        filePath.close()
        reslove(items[items.length - 1])
      })
    })
  })
}

export async function getVideos() {
  const response = await fetch('https://api.bilibili.com/x/space/wbi/arc/search?mid=43664526', {
    headers: {
      'user-agent':
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.110 Safari/537.36',
    },
  })
  const res: JSONResponse = await response.json()

  const videos = res.data.list.vlist

  for (let index = 0; index < videos.length; index++) {
    const vitem = videos[index]
    const pic = await download(vitem.pic)
    vitem.pic = pic
  }

  return videos
}
