import '../styles/index.css';
//import 'github-markdown-css';
import 'katex/dist/katex.css';
import 'bytemd/dist/index.css';
import 'highlight.js/styles/atom-one-dark.css';
import Layout from '../components/Layout';
import AdminLayout from '../components/AdminLayout';
import { useRouter } from 'next/router';

function MyApp({ Component, pageProps }) {
  const router = useRouter();
  if (['/admin/blog/create', '/login', '/register'].includes(router.pathname)) {
    return <Component {...pageProps} />;
  }

  if (router.pathname.includes('/admin')) {
    return (
      <AdminLayout>
        <Component {...pageProps} />
      </AdminLayout>
    );
  }

  return (
    <Layout>
      <Component {...pageProps} />
    </Layout>
  );
}

export default MyApp;
