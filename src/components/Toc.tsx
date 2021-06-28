import React, { useEffect, FC, useState } from 'react';
import * as bytemd from 'bytemd';
import visit from 'unist-util-visit';

export interface ViewerProps extends bytemd.ViewerProps {
  onClick: (index: number) => void;
  className?: string;
  previewRef: React.MutableRefObject<HTMLDivElement>;
}

function stringifyHeading(e: any) {
  let result = '';
  visit(e, (node: any) => {
    if (node.type === 'text') {
      result += node.value;
    }
  });
  return result;
}

export const Toc: FC<ViewerProps> = ({
  value,
  sanitize,
  onClick,
  className,
  previewRef,
}) => {
  const [items, setItem] = useState<{ level: number; text: string }[]>([]);
  const [currentBlockIndex, setCurrentBlockIndex] = useState(0);

  useEffect(() => {
    const plugins = [
      {
        rehype: (p) =>
          p.use(() => (hast, file) => {
            let items = [];
            let minLevel = 6;
            let currentHeadingIndex = 0;

            let currentBlockIndex: number;
            hast.children
              .filter(
                (v): v is Element =>
                  v.type === 'element' &&
                  v.tagName[0] === 'h' &&
                  !!v.children.length
              )
              .forEach((node, index) => {
                const i = Number(node.tagName[1]);
                minLevel = Math.min(minLevel, i);

                items.push({
                  level: i,
                  text: stringifyHeading(node),
                });
                if (currentBlockIndex >= index) {
                  currentHeadingIndex = items.length - 1;
                }
              });
            setItem(items);
          }),
      },
    ];
    try {
      bytemd.getProcessor({ sanitize, plugins }).processSync(value);
    } catch (err) {
      console.error(err);
    }
  }, [sanitize, value]);

  useEffect(() => {
    const handleScroll = () => {
      if (previewRef.current) {
        Array.from(previewRef.current.querySelectorAll('h2,h3,h4')).forEach(
          (item, index) => {
            if (
              item.getBoundingClientRect().y < 200 &&
              item.getBoundingClientRect().y > 0
            ) {
              setCurrentBlockIndex(index);
            }
          }
        );
      }
    };
    document.addEventListener('scroll', handleScroll);
    return () => {
      document.removeEventListener('scroll', handleScroll);
    };
  }, [previewRef]);

  return (
    <div className={className || ''}>
      <h2 className="leading-7 font-semibold">目录</h2>
      <ul>
        {items.map((item, index) => (
          <li
            className={`${
              index === currentBlockIndex ? 'text-skin-primary' : ''
            } leading-7 text-sm cursor-pointer whitespace-nowrap overflow-hidden overflow-ellipsis`}
            key={index}
            onClick={() => onClick(index)}
            style={{
              paddingLeft: (item.level - 2) * 16,
            }}
          >
            {item.text}
          </li>
        ))}
      </ul>
    </div>
  );
};
