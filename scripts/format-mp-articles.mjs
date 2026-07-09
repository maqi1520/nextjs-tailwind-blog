import fs from 'fs'
import path from 'path'
import GithubSlugger from 'github-slugger'

const slugger = new GithubSlugger()
const slug = (str) => slugger.slug(str)

const dir = path.join(process.cwd(), 'data/blog/mp')

function escapeYaml(str) {
  return str.replace(/'/g, "''")
}

function parseWeChatArticle(content) {
  const lines = content.split('\n')
  let i = 0
  let title = ''

  if (lines[0]?.startsWith('# ')) {
    title = lines[0].slice(2).trim()
    i = 1
  }

  while (i < lines.length && lines[i].trim() === '') i++

  let date = null
  if (lines[i] && /^原创/.test(lines[i])) {
    const match = lines[i].match(/(\d{4})-(\d{2})-(\d{2})/)
    if (match) {
      date = `${match[1]}/${parseInt(match[2], 10)}/${parseInt(match[3], 10)}`
    }
    i++
  }

  while (i < lines.length && lines[i].trim() === '') i++

  if (lines[i]?.startsWith('> 原文地址')) {
    i++
    while (i < lines.length && lines[i].trim() === '') i++
  }

  return {
    title,
    date,
    body: lines.slice(i).join('\n').trimStart(),
  }
}

function extractFirstImage(content) {
  const patterns = [
    /!\[[^\]]*\]\((https?:\/\/[^)\s]+)(?:\s+['"][^'"]*['"])?\)/,
    /!\[\]\((https?:\/\/[^)\s]+)(?:\s+['"][^'"]*['"])?\)/,
  ]

  for (const pattern of patterns) {
    const match = content.match(pattern)
    if (match) return match[1]
  }

  return null
}

function extractSummary(body) {
  const lines = body.split('\n')

  for (const line of lines) {
    const text = line.trim()
    if (!text) continue
    if (text.startsWith('![')) continue
    if (text.startsWith('#')) continue
    if (text.startsWith('>')) continue
    if (text.startsWith('---')) continue
    if (/^图\d+$/.test(text)) continue

    const plain = text
      .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
      .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
      .replace(/[#*`]/g, '')
      .trim()

    if (plain.length > 10) {
      return plain.length > 150 ? `${plain.slice(0, 150)}...` : plain
    }
  }

  return ''
}

function buildFrontmatter({ title, date, summary, image, articleSlug }) {
  const lines = ['---', `title: ${title}`, `date: '${date}'`, `lastmod: '${date}'`, `tags: [公众号]`]

  lines.push('draft: false')

  if (summary) {
    lines.push(`summary: '${escapeYaml(summary)}'`)
  }

  if (image) {
    lines.push(`images: [${image}]`)
  }

  lines.push("authors: ['default']", 'layout: PostLayout', `slug: ${articleSlug}`, '---', '')

  return lines.join('\n')
}

const files = fs.readdirSync(dir).filter((file) => file.endsWith('.md'))

for (const file of files) {
  const filePath = path.join(dir, file)
  const content = fs.readFileSync(filePath, 'utf8')

  if (content.startsWith('---')) {
    console.log(`skip (already formatted): ${file}`)
    continue
  }

  const { title, date, body } = parseWeChatArticle(content)
  const image = extractFirstImage(body)
  const summary = extractSummary(body)
  const articleSlug = slug(title)

  if (!title || !date) {
    console.error(`failed: ${file} (title=${title}, date=${date})`)
    continue
  }

  const frontmatter = buildFrontmatter({ title, date, summary, image, articleSlug })
  fs.writeFileSync(filePath, `${frontmatter}${body}\n`, 'utf8')
  console.log(`formatted: ${file}`)
}
