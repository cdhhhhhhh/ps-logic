import { Button, Divider } from '@blueprintjs/core';
import React from 'react';
import { Select } from '@blueprintjs/select';

const PeriodSelect = Select.ofType<{ name: number }>();
// const FrequencySelect = Select.ofType<number>();

const PeriodSelectList = [{ name: 1 }, { name: 2 }, { name: 3 }, { name: 4 }];

const OptionList = [
  [
    {
      icon: 'iconmoshihuise',
      title: '配置',
    },
  ],
  [
    {
      icon: 'iconi-ks',
      title: '开始',
    },
    {
      icon: 'iconbaocunhaibao',
      title: '立即',
    },
  ],
  [
    {
      icon: 'iconchufaqipeizhi',
      title: '触发',
    },
    {
      icon: 'iconjiema-zhuji',
      title: '解码',
    },
    {
      icon: 'iconceliang',
      title: '测量',
    },
  ],
  [
    {
      icon: 'iconsoushuo',
      title: '搜索',
    },
  ],
];

const ViewOption = () => {
  return (
    <div className="flex">
      <div className="px-2 my-2 cursor-pointer flex flex-col">
        {/* <PeriodSelect */}
        {/*  filterable={false} */}
        {/*  itemRenderer={(item) => <div key={item.name}>{`${item.name}s`}</div>} */}
        {/*  onItemSelect={() => {}} */}
        {/*  items={PeriodSelectList} */}
        {/* > */}
        {/*  <Button */}
        {/*    text={`${PeriodSelectList[0].name}s`} */}
        {/*    rightIcon="double-caret-vertical" */}
        {/*  /> */}
        {/* </PeriodSelect> */}
        {/* <PeriodSelect */}
        {/*  filterable={false} */}
        {/*  itemRenderer={(item) => <div key={item.name}>{`${item.name}s`}</div>} */}
        {/*  onItemSelect={() => {}} */}
        {/*  items={PeriodSelectList} */}
        {/* > */}
        {/*  <Button */}
        {/*    text={`${PeriodSelectList[0].name}s`} */}
        {/*    rightIcon="double-caret-vertical" */}
        {/*  /> */}
        {/* </PeriodSelect> */}
      </div>
      {OptionList.map((i, index) => {
        return (
          // eslint-disable-next-line react/no-array-index-key
          <React.Fragment key={index}>
            {i.map((j) => {
              return (
                <div
                  key={j.title}
                  className="px-2 my-2 cursor-pointer flex flex-col items-center"
                >
                  <i className={`iconfont text-2xl ${j.icon}`} />
                  <p className="mt-1">{j.title}</p>
                </div>
              );
            })}
            <Divider />
          </React.Fragment>
        );
      })}
    </div>
  );
};
export default ViewOption;
