import React, { useLayoutEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { useMount } from 'ahooks';
import { observer } from 'mobx-react-lite';
import ChartStore from '../../store/chart';

type LineType = { date: number; value: number };
function mockData() {
  const length = 1001;
  const arr: Array<LineType> = [];
  for (let i = 0; i < length; i += 1) {
    arr.push({
      date: i,
      value: d3.randomInt(0, 2)(),
    });
  }
  // console.log(arr);
  return arr;
}
const ChartRenderView: React.FC<{
  setMarkLineList: Function;
  chartStore: ChartStore;
}> = ({ setMarkLineList, chartStore }) => {
  const create = (width: number) => {
    const height = 100;
    const data = mockData();
    let rangeList = [];

    // 横向坐标
    // 配置基本信息
    const xscale = d3.scaleLinear().range([0, width]).domain([0, data.length]);
    const yscale = d3.scaleLinear().range([0, height]).domain([0, 1]);
    let currentScale = xscale;
    // 视图笔刷
    // function addMainBrush() {
    //   const mainBrush = d3
    //     .brushX()
    //     .extent([
    //       [0, 0],
    //       [width, height],
    //     ])
    //     .on((event) => {
    //       console.log(event);
    //     });
    //   svg.call(mainBrush);
    // }
    const axisSvg = d3
      .select('#svg')
      .append('svg')
      .attr('id', 'axisSvg')
      .attr('width', width)
      .attr('height', 20)
      .on('click', (event) => {
        const { clientX } = event;
        // 增加坐标
        // console.log(currentScale.invert(clientX));
        chartStore.addMarkList(currentScale.invert(clientX));
        updateMark();
      })
      .append('g')
      .attr('transform', `translate(${0},${15})`);

    // 折线图

    const svg = d3
      .select('#svg')
      .append('svg')
      .attr('width', width)
      .attr('height', height);

    const axisX = (x: any) => {
      return d3
        .axisTop(x)
        .ticks(width / 80)
        .tickSizeOuter(0);
    };
    const axisY = () => {
      return d3.axisLeft(yscale);
    };
    const path = svg
      .append('path')
      .datum(data)
      .attr('fill', 'none')
      .attr('stroke', 'steelblue')
      .attr('stroke-width', 1)
      .attr('stroke-linejoin', 'round')
      .attr('stroke-linecap', 'round');
    // const line = d3
    //   .line<LineType>()
    //   .curve(d3.curveStep)
    //   .defined((d) => !Number.isNaN(d.value))
    //   .x((d) => xscale(d.date))
    //   .y((d) => yscale(d.value));

    // 建立滚动条SVG
    const brushSvg = d3
      .select('#svg')
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .append('g');

    function createLine(x: any) {
      return d3
        .line<LineType>()
        .curve(d3.curveStep)
        .defined((d) => !Number.isNaN(d.value))
        .x((d) => x(d.date))
        .y((d) => yscale(d.value));
    }

    const update = (x: any) => {
      // 控制坐标
      axisSvg.call(axisX(x));
      // g.append('g').transition().call(axisY);

      path.attr('d', createLine(x));
    };

    function updateBrush(start: number, end: number) {
      // DOM和笔刷关联
      brushSvg.call(brush).call(brush.move, [start, end]);
      // brushGroup.selectAll('rect').attr('height', 200);
    }
    const zoom = d3
      .zoom<SVGElement, LineType>()
      .scaleExtent([1, data.length])
      .translateExtent([
        [0, -Infinity],
        [width, Infinity],
      ])
      .on('zoom', (event) => {
        const x = event.transform.rescaleX(xscale);
        const total = data.length;
        // console.log(event.transform.k);
        // console.log(event.transform.x);
        // console.log(event.transform.y);
        currentScale = event.transform.rescaleX(xscale);
        // console.log(x.domain()[1] - x.domain()[0]);
        // console.log((x.domain()[1] - x.domain()[0]`) / total);
        updateMark();
        updateRange();
        updateBrush(
          (width * x.domain()[0]) / total,
          (width * x.domain()[1]) / total
        );
        update(x);
      });

    const updateMark = () => {
      setMarkLineList(
        chartStore.markList.map((item, index) => {
          return {
            index,
            start: currentScale(item),
          };
        })
      );
    };
    const updateRange = () => {
      if (rangeList.length > 0) {
        rangeList.forEach((i) => i.remove());
        rangeList = [];
      }
      rangeList = chartStore.rangeList.map((i) => {
        const [start, end] = i;
        return svg
          .append('rect')
          .attr('x', currentScale(start))
          .attr('y', 0)
          .attr('width', currentScale(end) - currentScale(start))
          .attr('height', height);
      });
    };
    // 滚动刷新数据
    const brushed = (event: any) => {
      // const s = event.selection || x.range();
      if (event.selection && event.sourceEvent) {
        const s = event.selection;
        // update(xscale.copy().domain(event.selection.map(xscale.invert)));
        svg.call(
          zoom.transform,
          d3.zoomIdentity.scale(width / (s[1] - s[0])).translate(-s[0], 0)
        );
      }
    };
    const brushIng: {
      state: boolean;
      start: number;
      rect: any;
      startSvg: any;
    } = {
      state: false,
      start: NaN,
      rect: undefined,
    };
    // 建立笔刷
    const brush = d3
      .brushX()
      .extent([
        [0, 0],
        [width, 200],
      ])
      .on('brush end', brushed);
    // 初始化状态
    svg
      .call(zoom)
      .on('click', (event) => {
        if (brushIng.state) {
          chartStore.addRange([
            currentScale.invert(brushIng.start),
            currentScale.invert(brushIng.start) +
              currentScale.invert(brushIng.rect.attr('width')),
          ]);
          brushIng.state = false;
          brushIng.start = NaN;

          brushIng.startSvg.remove();
          brushIng.rect.remove();
          updateRange();
        } else {
          const { clientX } = event;
          brushIng.startSvg = svg
            .append('line')
            .attr('x1', clientX)
            .attr('y1', 0)
            .attr('x2', clientX)
            .attr('y2', height)
            .attr('stroke', 'black');
          brushIng.rect = svg
            .append('rect')
            .attr('x', clientX)
            .attr('y', 0)
            .attr('width', 0)
            .attr('height', height);
          brushIng.state = true;
          brushIng.start = clientX;
        }
      })
      .on('mousemove', (event) => {
        const { clientX } = event;
        if (brushIng.state) {
          brushIng.rect.attr('width', clientX - brushIng.start);
        }
      });
    update(xscale);
    updateBrush(0, width);
    return update;
  };
  const ref = useRef<HTMLDivElement>(null);

  useMount(() => {
    const wrapper = ref.current;
    if (wrapper) {
      create(wrapper.clientWidth);
    }
  });
  return <div ref={ref} id="svg" />;
};
const ChartMainView: React.FC<{
  chartStore: ChartStore;
}> = observer(({ chartStore }) => {
  const [markLineList, setMarkLineList] = useState([]);

  return (
    <div className="flex-1 relative">
      {markLineList.map((item, index) => {
        return (
          <div
            key={index}
            className="absolute h-full bg-red-900 left-0 w-px"
            style={{ left: `${item.start}px` }}
          />
        );
      })}
      <ChartRenderView
        chartStore={chartStore}
        setMarkLineList={setMarkLineList}
      />
    </div>
  );
});

export default ChartMainView;
