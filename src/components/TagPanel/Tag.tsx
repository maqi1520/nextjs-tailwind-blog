import React from 'react';
import cl from 'classnames';

interface Props {
  children: React.ReactNode;
  className?: string;
  checked?: boolean;
  onClick?: () => void;
  onChange?: (v: boolean) => void;
}

export default function Tag({
  children,
  checked,
  className,
  onClick,
  onChange,
}: Props) {
  const handleClick = () => {
    onChange && onChange(!checked);
    onClick && onClick();
  };
  return (
    <span
      onClick={handleClick}
      className={cl(
        'border px-2 py-1 rounded-sm text-xs mb-2 mr-2 cursor-pointer whitespace-nowrap inline-block',
        className,
        {
          'border-skin-primary text-skin-primary': checked,
        }
      )}
    >
      {children}
    </span>
  );
}
