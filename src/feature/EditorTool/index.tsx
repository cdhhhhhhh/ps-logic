import React from 'react';
import './index.global.scss';
import { Tab, Tabs, Divider, Button } from '@blueprintjs/core';
import { Select } from '@blueprintjs/select';
import styles from './index.scss';

const PeriodSelect = Select.ofType<{ name: number }>();
// const FrequencySelect = Select.ofType<number>();

const PeriodSelectList = [{ name: 1 }, { name: 2 }, { name: 3 }, { name: 4 }];
const ViewOption = () => {
  return (
    <div className="flex">
      <div className="px-2 my-2 cursor-pointer flex flex-col">
        <PeriodSelect
          filterable={false}
          itemRenderer={(item) => <div key={item.name}>{`${item.name}s`}</div>}
          onItemSelect={() => {}}
          items={PeriodSelectList}
        >
          <Button
            text={`${PeriodSelectList[0].name}s`}
            rightIcon="double-caret-vertical"
          />
        </PeriodSelect>
        <PeriodSelect
          filterable={false}
          itemRenderer={(item) => <div key={item.name}>{`${item.name}s`}</div>}
          onItemSelect={() => {}}
          items={PeriodSelectList}
        >
          <Button
            text={`${PeriodSelectList[0].name}s`}
            rightIcon="double-caret-vertical"
          />
        </PeriodSelect>
      </div>
      <Divider />
      <div className="px-2 my-2 cursor-pointer flex flex-col items-center">
        <i className="iconfont text-2xl iconmoshihuise" />
        <p className="mt-1">模式</p>
      </div>
      <div className="px-2 my-2 cursor-pointer flex flex-col items-center">
        <i className="iconfont text-2xl iconi-ks" />
        <p className="mt-1">开始</p>
      </div>
      <div className="px-2 my-2 cursor-pointer flex flex-col items-center">
        <i className="iconfont text-2xl iconbaocunhaibao" />
        <p className="mt-1">立即</p>
      </div>
      <Divider />
      <div className="px-2 my-2 cursor-pointer flex flex-col items-center">
        <i className="iconfont text-2xl iconchufaqipeizhi" />
        <p className="mt-1">触发</p>
      </div>
      <div className="px-2 my-2 cursor-pointer flex flex-col items-center">
        <i className="iconfont text-2xl iconjiema-zhuji" />
        <p className="mt-1">解码</p>
      </div>
      <div className="px-2 my-2 cursor-pointer flex flex-col items-center">
        <i className="iconfont text-2xl iconceliang" />
        <p className="mt-1">测量</p>
      </div>
      <Divider />
      <div className="px-2 my-2 cursor-pointer flex flex-col items-center">
        <i className="iconfont text-2xl iconsoushuo" />
        <p className="mt-1">搜索</p>
      </div>
    </div>
  );
};

const Demo = () => {
  return <div>demo</div>;
};

const EditorTool: React.FC = () => {
  return (
    <div className={styles.EditorTool}>
      <Tabs id="TabsExample" selectedTabId="ViewOption">
        <Tab
          className="px-3"
          id="ViewOption"
          title="选项"
          panel={<ViewOption />}
        />
        <Tab id="dev" title="开发者工具" panel={<Demo />} />
      </Tabs>
    </div>
  );
};

export default EditorTool;
