import React, { ReactElement } from 'react';

interface Props {}

export default function project({}: Props): ReactElement {
  return (
    <div>
      <h2 className="text-skin-primary text-3xl font-medium">项目管理</h2>
    </div>
  );
}
