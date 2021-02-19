import React from 'react';
import EditorTool from '../../feature/EditorTool';
import ChartView from '../../feature/ChartView';
import EditorConfig from '../../feature/EditorConfig';

const DeviceView = () => {
  return (
    <div className="flex flex-col h-screen">
      <EditorTool />
      <div className="flex flex-1">
        <ChartView />
        <EditorConfig />
      </div>
    </div>
  );
};
export default DeviceView;
