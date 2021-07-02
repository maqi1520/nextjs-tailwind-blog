import React, { ReactElement } from 'react';

interface Props {
  total: number;
  pageSize?: number;
  current: number;
  onChange: (total: number, pageSize: number) => void;
}

export default function Pagination({
  total = 0,
  current = 1,
  pageSize = 10,
  onChange,
}: Props): ReactElement {
  return (
    <div className="py-4 flex justify-end items-center">
      <span className="mr-2">
        总共<span className="font-semibold mx-1">{total}</span>条
      </span>
      {current > 1 && (
        <button
          onClick={() => onChange(+current - 1, pageSize)}
          className="btn"
        >
          上一页
        </button>
      )}
      {total > 0 && (
        <span className="border px-4 py-2 leading-5 text-skin-primary m-2">
          {current}
        </span>
      )}

      {total > pageSize * current && (
        <button
          onClick={() => onChange(+current + 1, pageSize)}
          className="btn"
        >
          下一页
        </button>
      )}
    </div>
  );
}
