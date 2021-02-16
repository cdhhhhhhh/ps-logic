import { Checkbox, Collapse, Icon } from '@blueprintjs/core';
import React, { useState } from 'react';

const BaseConfig = () => {
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
    </div>
  );
};

export default BaseConfig;
