import React, { useState } from 'react';
import './index.global.scss';
import { Tab, Tabs } from '@blueprintjs/core';
import styles from './index.scss';
import ViewOption from './ViewOption';
import DevToolOption from './DevToolOption';
import PluginOption from './PluginOption';

const toolOptionList = [
  {
    id: 'View',
    title: '选项',
    view: ViewOption,
  },
  {
    id: 'plugin',
    title: '插件',
    view: PluginOption,
  },
  {
    id: 'devtool',
    title: '开发工具',
    view: DevToolOption,
  },
];

const EditorTool: React.FC = () => {
  const [selectedOption, setSelectedOption] = useState(toolOptionList[0].id);

  return (
    <div className={styles.EditorTool}>
      <Tabs
        selectedTabId={selectedOption}
        onChange={(val) => {
          setSelectedOption(val.toString());
        }}
      >
        {toolOptionList.map((i) => {
          return (
            <Tab
              key={i.id}
              className="px-3"
              id={i.id}
              title={i.title}
              panel={React.createElement(i.view)}
            />
          );
        })}
      </Tabs>
    </div>
  );
};

export default EditorTool;
