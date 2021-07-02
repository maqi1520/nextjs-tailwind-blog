const rewrites = [
  {
    source: '/admin/blog/:id',
    destination: `/admin/blog/create`,
  },
  {
    source: '/admin/project/:id',
    destination: `/admin/project/create`,
  },
];

module.exports = {
  eslint: {
    dirs: ['src', 'server'], // Only run ESLint on the 'pages' and 'utils' directories during production builds (next build)
  },
  async rewrites() {
    return rewrites;
  },
};
