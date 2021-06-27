const rewrites = [
  {
    source: '/admin/blog/:id',
    destination: `/admin/blog/create`,
  },
];

module.exports = {
  async rewrites() {
    return rewrites;
  },
};
