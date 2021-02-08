import React from 'react';
import { Checkbox, Divider, Tag } from '@blueprintjs/core';

const MeasureConfig = () => {
  const handleEnabledChange = () => {};

  return (
    <div>
      <p className="px-2 ">鼠标测量</p>
      <Divider />
      <div className="px-2">
        <Checkbox checked onChange={handleEnabledChange}>
          开始鼠标测量
        </Checkbox>
      </div>
      <div className="px-2">
        <p>宽度：####</p>
        <p>占空比：####</p>
        <p>周期：####</p>
        <p>频率：####</p>
      </div>
      <Divider />
      <p className="px-2 ">距离测量</p>
      <Divider />
      <div className="px-2 text-center">
        <div className="flex">
          <div className="flex-1">
            <Tag minimal>1</Tag>
            <span className="px-1">-</span>
            <Tag minimal>1</Tag>
          </div>
          <div className="flex-1">-23.32ms</div>
          <div className="flex-1">-323232</div>
        </div>
        <div className="flex" style={{ fontSize: '10px' }}>
          <div className="flex-1">通道对</div>
          <div className="flex-1">时间</div>
          <div className="flex-1">样本</div>
        </div>
      </div>
      <Divider />
      <p className="px-2 ">边沿统计</p>
      <Divider />
      <div className="px-2" />
      <Divider />
      <p className="px-2 ">光标</p>
      <Divider />
      <div className="px-2" />
      <Divider />
    </div>
  );
};

const EditorConfig: React.FC = () => {
  return (
    <div
      style={{ background: 'rgb(240,240,240)' }}
      className="w-64 h-full border py-2 text-xs"
    >
      <MeasureConfig />
    </div>
  );
};

export default EditorConfig;
