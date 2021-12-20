const Robots = () => {};

export const getServerSideProps = async ({ res }) => {
  const sitemap = `User-agent: *
  Sitemap: https://maqib.cn/sitemap.xml
  `;

  res.setHeader('Content-Type', 'text/plain');
  res.write(sitemap);
  res.end();

  return {
    props: {},
  };
};

export default Robots;
