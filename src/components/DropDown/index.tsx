import React, { ReactElement, useState, useEffect, useRef } from 'react';
import cl from 'classnames';

export function contains(root, n) {
  var node = n;
  while (node) {
    if (node === root) {
      return true;
    }

    node = node.parentNode;
  }
  return false;
}

interface Props {
  children: ReactElement;
  content: ReactElement;
}

export default function DropDown({ children, content }: Props): ReactElement {
  const ref = useRef(null);
  const [visible, setVlsible] = useState(false);
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setVlsible(false);
      }
    };
    if (visible) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [visible]);
  return (
    <span ref={ref} className="relative">
      {React.cloneElement(children, {
        onClick: () => setVlsible(true),
      })}
      <div
        className={cl(
          'absolute z-50 right-0 top-full transition-all duration-300 ease-in-out bg-skin-off-base shadow-sm overflow-hidden',
          {
            'h-auto  opacity-100': visible,
            'h-0 opacity-0': !visible,
          }
        )}
      >
        <div className="p-4">{content}</div>
      </div>
    </span>
  );
}
