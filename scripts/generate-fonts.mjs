import { access, mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { woff1ToSfnt } from './woff1-to-sfnt.mjs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const FONTS_DIR = join(ROOT, 'public', 'fonts')
const DIST_DIR = join(FONTS_DIR, 'dist')
const WASM_PATH = join(ROOT, 'node_modules', 'cn-font-split', 'dist', 'libffi-wasm32-wasip1.wasm')

const fonts = [
  {
    id: 'lxgw-wenkai-gb',
    label: '霞鹜文楷 GB',
    file: 'LXGWWenKaiGB-Regular.ttf',
    family: 'LXGWWenKaiGB',
    source: 'split',
  },
  {
    id: 'josefin-slab',
    label: 'Josefin Slab',
    file: 'JosefinSlab-Regular.ttf',
    family: 'JosefinSlab',
    source: 'file',
  },
]

/** 与 src/lib/handwriting-font-registry.json 保持一致 */
const FONT_CONFIG = fonts.filter((font) => font.source === 'split')

async function readFontInput(filePath) {
  const raw = await readFile(filePath)
  if (filePath.endsWith('.woff')) {
    return woff1ToSfnt(raw)
  }
  return new Uint8Array(raw)
}

async function writeSplitOutput(outDir, files) {
  for (const item of files) {
    if (!item) continue
    const target = join(outDir, item.name)
    await mkdir(dirname(target), { recursive: true })
    await writeFile(target, item.data)
  }
}

/**
 * 选择拆包实现：
 * - 优先用 wasm 构建（跨平台、CI 友好），需要 cn-font-split 的 wasm 二进制；
 * - 当本地装的是平台原生构建（仅有 .dylib/.so）、缺少 wasm 二进制时，
 *   退回到 Node FFI 原生实现（自身负责把产物写入 outDir）。
 */
async function createSplitter() {
  const hasWasm = await access(WASM_PATH).then(
    () => true,
    () => false
  )

  if (hasWasm) {
    const { fontSplit, StaticWasm } = await import('cn-font-split/dist/wasm/index.mjs')
    const wasm = new StaticWasm(new Uint8Array(await readFile(WASM_PATH)))
    return {
      mode: 'wasm',
      async run(options, outDir) {
        const files = await fontSplit(options, wasm.WasiHandle, {
          logger() {},
        })
        await writeSplitOutput(outDir, files)
      },
    }
  }

  const { fontSplit } = await import('cn-font-split/dist/auto.mjs')
  return {
    mode: 'native',
    async run(options) {
      // 原生 FFI 实现会自行把分片与 result.css 写入 outDir。
      await fontSplit(options)
    },
  }
}

async function splitFont(splitter, { id, file, family }) {
  const sourcePath = join(FONTS_DIR, file)
  const outDir = join(DIST_DIR, id)
  const input = await readFontInput(sourcePath)
  await mkdir(outDir, { recursive: true })

  console.log(`[generate:fonts] ${file} → dist/${id}/`)
  const started = performance.now()

  await splitter.run(
    {
      input,
      outDir,
      css: {
        fontFamily: family,
        fontDisplay: 'swap',
        fontWeight: '400',
        fontStyle: 'normal',
      },
      silent: true,
    },
    outDir
  )

  const produced = await readdir(outDir)
  const subsetCount = produced.filter((name) => name.endsWith('.woff2')).length

  const elapsed = ((performance.now() - started) / 1000).toFixed(1)
  console.log(`[generate:fonts] ✓ ${id}: ${subsetCount} 分片, result.css (${elapsed}s)`)

  return { id, family, cssPath: `dist/${id}/result.css`, subsetCount }
}

async function main() {
  const only = process.argv.slice(2).filter((arg) => !arg.startsWith('-'))
  const targets =
    only.length > 0
      ? FONT_CONFIG.filter((f) => only.includes(f.id) || only.includes(f.file))
      : FONT_CONFIG

  if (targets.length === 0) {
    console.error('未匹配到字体。可用 id：', FONT_CONFIG.map((f) => f.id).join(', '))
    process.exit(1)
  }

  const splitter = await createSplitter()
  console.log(`[generate:fonts] 使用 ${splitter.mode} 拆包实现`)

  // 全量构建时清空 dist；仅指定部分字体时保留其它字体已有产物。
  if (only.length === 0) {
    await rm(DIST_DIR, { recursive: true, force: true })
  }
  await mkdir(DIST_DIR, { recursive: true })

  const built = []
  for (const font of targets) {
    built.push(await splitFont(splitter, font))
  }

  // 子集构建时合并已有 manifest，保持其它字体记录完整。
  let manifest = built
  if (only.length > 0) {
    const existing = await readFile(join(DIST_DIR, 'manifest.json'), 'utf8')
      .then((raw) => JSON.parse(raw))
      .catch(() => [])
    const builtIds = new Set(built.map((item) => item.id))
    manifest = [...existing.filter((item) => !builtIds.has(item.id)), ...built]
  }

  await writeFile(join(DIST_DIR, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`)

  const entries = await readdir(DIST_DIR)
  console.log(
    `[generate:fonts] 完成：${manifest.length} 款字体，输出目录 public/fonts/dist/（${entries.length} 项）`
  )
}

main()
  .then(() => {
    // 原生 FFI 构建在进程退出（卸载 dylib）时可能触发 SIGABRT，
    // 此时拆包产物已全部写盘，主动以 0 退出，避免误报失败。
    process.exit(0)
  })
  .catch((err) => {
    console.error('[generate:fonts] 失败:', err)
    process.exit(1)
  })
