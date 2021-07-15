import visit from 'unist-util-visit';

/**
 *
 * - [Markdown generic directives proposal](https://talk.commonmark.org/t/generic-directives-plugins-syntax/444)
 * - [Creating remark plugins](https://unifiedjs.com/learn/guide/create-a-plugin/)
 *
 * [mdast]: https://github.com/syntax-tree/mdast
 * [hast]: https://github.com/syntax-tree/hast#nodes
 * [remark-rehype]: https://github.com/remarkjs/remark-rehype
 *
 */

export const linkNofollow = () => {
  return {
    remark: (p) =>
      p.use(() => (tree) => {
        visit(tree, 'link', (node: any) => {
          const props = {
            title: undefined,
            target: '_blank',
            rel: 'nofollow',
          };
          if (node.title !== null && node.title !== undefined) {
            props.title = node.title;
          }
          const data = node.data || (node.data = {});
          data.hProperties = { ...props };
        });
      }),
    // rehype: (p) =>
    // p.use(() => (tree) => {
    //   visit(tree, 'element', (node: any) => {
    //     console.log(node);

    //     const props = {
    //       target: '_blank',
    //       rel: 'nofollow',
    //     };
    //     if (node.title !== null && node.title !== undefined) {
    //       props.title = node.title;
    //     }
    //     if (node.tagName === 'a') {
    //       node.properties = { ...node.properties, ...props };
    //     }

    //     //const data = node.data || (node.data = {});
    //     //data.hProperties = { ...props };
    //   });
    // }),
  };
};
