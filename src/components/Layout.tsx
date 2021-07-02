import * as React from 'react';
import Footer from './Footer';
import Header from './Header';

export default function Layout({ children }) {
  return (
    <>
      <Header />
      <div className="mx-auto lg:max-w-4xl md:max-w-3xl">{children}</div>
      <Footer />
    </>
  );
}

export const getLayout = page => <Layout>{page}</Layout>;

