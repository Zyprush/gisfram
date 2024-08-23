

import React from 'react';

const Loading: React.FC = () => {
  return (
    <div className="flex flex-1">
      <div className="h-full w-full rounded-lg bg-gray-100 dark:bg-neutral-800 animate-pulse"></div>
    </div>
  );
};

export default Loading;
