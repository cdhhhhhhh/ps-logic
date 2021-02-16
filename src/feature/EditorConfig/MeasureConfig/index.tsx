import { Checkbox, Collapse, Divider, Icon, Tag } from '@blueprintjs/core';
import React, { useState } from 'react';

const MeasureConfig = () => {
  const handleEnabledChange = () => {};

  const [isOpen, setIsOpen] = useState(true);
  return (
    <div>
      <div className="p-2  border-gray-300 border-b">
        <div
          className="flex justify-between"
          onClick={() => setIsOpen(!isOpen)}
        >
          <span className="text-gray-700 font-semibold">鼠标测量</span>
          <Icon iconSize={14} icon="chevron-right" />
        </div>
        <Collapse transitionDuration={0} keepChildrenMounted isOpen={isOpen}>
          <div className="py-2 border-gray-300 border-t mt-2">
            <Checkbox checked onChange={handleEnabledChange}>
              开始鼠标测量
            </Checkbox>
            <div>
              <p>宽度：####</p>
              <p>占空比：####</p>
              <p>周期：####</p>
              <p>频率：####</p>
            </div>
          </div>
        </Collapse>
      </div>
      {/* <p className="px-2 ">距离测量</p> */}
      {/* <Divider /> */}
      {/* <div className="px-2 text-center"> */}
      {/*  <div className="flex"> */}
      {/*    <div className="flex-1"> */}
      {/*      <Tag minimal>1</Tag> */}
      {/*      <span className="px-1">-</span> */}
      {/*      <Tag minimal>1</Tag> */}
      {/*    </div> */}
      {/*    <div className="flex-1">-23.32ms</div> */}
      {/*    <div className="flex-1">-323232</div> */}
      {/*  </div> */}
      {/*  <div className="flex" style={{ fontSize: '10px' }}> */}
      {/*    <div className="flex-1">通道对</div> */}
      {/*    <div className="flex-1">时间</div> */}
      {/*    <div className="flex-1">样本</div> */}
      {/*  </div> */}
      {/* </div> */}
      {/* <Divider /> */}
      {/* <p className="px-2 ">边沿统计</p> */}
      {/* <Divider /> */}
      {/* <div className="px-2" /> */}
      {/* <Divider /> */}
      {/* <p className="px-2 ">光标</p> */}
      {/* <Divider /> */}
      {/* <div className="px-2" /> */}
      {/* <Divider /> */}
    </div>
  );
};

export default MeasureConfig;
