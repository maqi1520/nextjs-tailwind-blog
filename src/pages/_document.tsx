import Document, { Html, Head, Main, NextScript } from 'next/document'

class MyDocument extends Document {
  render() {
    return (
      <Html lang="zh-CN" className="scroll-smooth" data-theme="sage">
        <Head>
          <link rel="apple-touch-icon" sizes="76x76" href="/static/favicons/apple-touch-icon.png" />
          <link
            rel="icon"
            type="image/png"
            sizes="32x32"
            href="/static/favicons/favicon-32x32.png"
          />
          <link
            rel="icon"
            type="image/png"
            sizes="16x16"
            href="/static/favicons/favicon-16x16.png"
          />
          <link rel="manifest" href="/static/favicons/site.webmanifest" />
          <link rel="mask-icon" href="/static/favicons/safari-pinned-tab.svg" color="#5bbad5" />
          <meta name="msapplication-TileColor" content="#000000" />
          <meta name="theme-color" content="#000000" />
          <meta name="referrer" content="no-referrer" />
          <link rel="alternate" type="application/rss+xml" href="/feed.xml" />
          <link rel="stylesheet" href="/fonts/dist/lxgw-wenkai-gb/result.css" />
          <script
            dangerouslySetInnerHTML={{
              __html: `
                (function () {
                  try {
                    var key = 'blog-theme';
                    var allowed = ['sage','cream','blue','mint','purple','mono'];
                    var saved = localStorage.getItem(key);
                    var theme = allowed.indexOf(saved) > -1 ? saved : 'sage';
                    document.documentElement.setAttribute('data-theme', theme);
                    document.documentElement.style.background = 'var(--bg)';
                  } catch (e) {}
                })();
              `,
            }}
          />
        </Head>
        <body className="bg-skin-bg text-skin-text antialiased" data-theme="sage">
          <Main />
          <NextScript />
        </body>
      </Html>
    )
  }
}

export default MyDocument
