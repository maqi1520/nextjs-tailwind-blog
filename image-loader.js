export default function myImageLoader({ src, width, quality }) {
  return `/${src}?w=${width}&q=${quality || 75}`
}
