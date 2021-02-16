import React from 'react';
import MeasureConfig from './MeasureConfig';

const EditorConfig: React.FC = () => {
  return (
    <div
      style={{ background: 'rgb(240,240,240)' }}
      className="w-64 h-full border  text-xs"
    >
      <MeasureConfig />
    </div>
  );
};

export default EditorConfig;
