import Document, { Html, Head, Main, NextScript } from 'next/document';
import { description, keywords } from '../config';

class MyDocument extends Document {
  static async getInitialProps(ctx) {
    const initialProps = await Document.getInitialProps(ctx);
    return { ...initialProps };
  }

  render() {
    return (
      <Html className="theme-light" lang="zh-CN">
        <Head>
          <meta name="description" content={description} />
          <meta name="keywords" content={keywords} />
          <link rel="icon" href="/favicon.ico" />
        </Head>
        <body className="text-skin-base transition-colors bg-skin-base text-sm">
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;
