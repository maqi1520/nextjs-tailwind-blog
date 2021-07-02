import '../styles/index.css';
//import 'github-markdown-css';
import 'katex/dist/katex.css';
import 'bytemd/dist/index.css';
import 'highlight.js/styles/atom-one-dark.css';
import { SWRConfig } from 'swr';

function MyApp({ Component, pageProps }) {
  const getLayout = Component.getLayout;

  return (
    <SWRConfig
      value={{
        onErrorRetry: (error, key, config, revalidate, { retryCount }) => {
          // 404 时不重试。
          if (error.status === 404 || error.status === 401) return;

          // 最多重试 10 次。
          if (retryCount >= 10) return;
        },
      }}
    >
      {getLayout ? (
        getLayout(<Component {...pageProps} />)
      ) : (
        <Component {...pageProps} />
      )}
    </SWRConfig>
  );
}

export default MyApp;
