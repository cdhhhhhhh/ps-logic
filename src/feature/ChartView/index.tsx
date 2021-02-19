import React, { useRef, useState } from 'react';
import * as d3 from 'd3';
import { useMount } from 'ahooks';
import { observer } from 'mobx-react-lite';
import ChartStore from '../../store/chart';
import rootStore from '../../store';

type LineType = { date: number; value: number };

async function getDataCVS(): Promise<
  Array<{
    [index: string]: number;
  }>
> {
  try {
    return await d3.csv<{
      [index: string]: number;
    }>('mock/digital.csv', d3.autoType);
  } catch (e) {
    return [];
  }
}

async function renderView({ width, setMarkLineList, chartStore }) {
  // 基本配置
  const chartHeight = 100;
  const data = await getDataCVS();
  let currentRangeList: Array<any> = [];
  let chartViewList: Array<{ view: any; update: any }> = [];
  const maxAxisX = data[data.length - 1]['Time [s]'];
  const xscale = d3
    .scaleLinear()
    .range([0, width])
    .domain([data[0]['Time [s]'], maxAxisX]);
  const yscale = d3.scaleLinear().range([0, chartHeight]).domain([0, 1]);

  const axisX = (x: any) => {
    return d3
      .axisTop(x)
      .ticks(width / 80)
      .tickSizeOuter(0);
  };
  const zoom = d3
    .zoom<SVGElement, LineType>()
    .scaleExtent([1, data.length])
    .translateExtent([
      [0, -Infinity],
      [width, Infinity],
    ]);
  const brush = d3.brushX().extent([
    [0, 0],
    [width, 200],
  ]);
  let currentScale = xscale;

  // DOM元素绑定顺序
  const mainView = d3.select('#svg');
  let axisXView = mainView
    .append('svg')
    .attr('id', 'axisSvg')
    .attr('width', width)
    .attr('height', 20);

  const chartView = d3.select('#svg').append('div');
  const brushView = mainView
    .append('svg')
    .attr('width', width)
    .attr('height', 100)
    .append('g');

  const createChartView = (key: string, index: number) => {
    const brushIng: {
      state: boolean;
      start: number;
      rect: any;
      startSvg: any;
    } = {
      state: false,
      start: NaN,
      rect: undefined,
      startSvg: undefined,
    };
    const chartViewLine = chartView
      .append('svg')
      .attr('class', 'mt-3')
      .attr('width', width)
      .attr('height', chartHeight)
      .on('click', (event) => {
        // 不支持负数
        if (brushIng.state) {
          const { clientX } = event;
          chartStore.addRange({
            index,
            start: currentScale.invert(brushIng.start),
            end: currentScale.invert(clientX),
          });

          brushIng.state = false;
          brushIng.start = NaN;

          brushIng.startSvg.remove();
          brushIng.rect.remove();
          updateRange();
        } else {
          const { clientX } = event;
          brushIng.startSvg = chartViewList[index].view
            .append('line')
            .attr('x1', clientX)
            .attr('y1', 0)
            .attr('x2', clientX)
            .attr('y2', chartHeight)
            .attr('stroke', 'black');
          brushIng.rect = chartViewList[index].view
            .append('rect')
            .attr('x', clientX)
            .attr('y', 0)
            .attr('width', 0)
            .attr('height', chartHeight);
          brushIng.state = true;
          brushIng.start = clientX;
        }
      })
      .on('mousemove', (event) => {
        const { clientX } = event;
        if (brushIng.state) {
          brushIng.rect.attr('width', clientX - brushIng.start);
        }
      })
      .on('mouseup', () => {
        console.log('test');
      });
    const path = chartViewLine
      .append('path')
      .datum(data)
      .attr('fill', 'none')
      .attr('stroke', 'steelblue')
      .attr('stroke-width', 1)
      .attr('stroke-linejoin', 'round')
      .attr('stroke-linecap', 'round');

    return {
      view: chartViewLine,
      update: () => {
        return path.attr(
          'd',
          d3
            .line<any>()
            .curve(d3.curveStep)
            .defined((d) => !Number.isNaN(d.value))
            .x((d) => currentScale(d['Time [s]']))
            .y((d) => yscale(d[key]))
        );
      },
    };
  };
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
    if (currentRangeList.length > 0) {
      currentRangeList.forEach((i) => i.remove());
      currentRangeList = [];
    }
    currentRangeList = chartStore.rangeList.map((i) => {
      const { start, end, index } = i;
      return chartViewList[index].view
        .append('rect')
        .attr('x', currentScale(start))
        .attr('y', 0)
        .attr('width', currentScale(end) - currentScale(start))
        .attr('height', chartHeight);
    });
  };
  const update = () => {
    axisXView.call(axisX(currentScale));
    chartViewList.forEach((chartViewItem) => {
      chartViewItem.update();
    });
    brushView.call(brush.move, [
      (width * currentScale.domain()[0]) / maxAxisX,
      (width * currentScale.domain()[1]) / maxAxisX,
    ]);
    updateMark();
    updateRange();
  };
  const init = () => {
    const list = Array.from({ length: 5 }, (_, index) => {
      const temp = createChartView('Channel 0', index);
      temp.update();
      return temp;
    });
    chartViewList = list;
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    axisXView = axisXView
      .on('click', (event) => {
        const { clientX } = event;
        chartStore.addMarkList(currentScale.invert(clientX));
        updateMark();
      })
      .append('g')
      .attr('transform', `translate(${0},${15})`);
    zoom.on('zoom', (event) => {
      currentScale = event.transform.rescaleX(xscale);
      update();
    });

    brush.on('brush end', (event) => {
      if (event.selection && event.sourceEvent) {
        const s = event.selection;
        mainView.call(
          zoom.transform,
          d3.zoomIdentity.scale(width / (s[1] - s[0])).translate(-s[0], 0)
        );
      }
    });

    chartView.call(zoom);
    brushView.call(brush);
    update();
  };
  init();
}

const ChartRenderView: React.FC<{
  setMarkLineList: any;
  chartStore: ChartStore;
}> = observer(({ setMarkLineList, chartStore }) => {
  const ref = useRef<HTMLDivElement>(null);
  useMount(() => {
    const wrapper = ref.current;
    if (wrapper) {
      // create(wrapper.clientWidth);
      renderView({ width: wrapper.clientWidth, setMarkLineList, chartStore })
        .then()
        .catch();
    }
  });
  return <div ref={ref} id="svg" />;
});
const ChartMainView: React.FC = () => {
  const [markLineList, setMarkLineList] = useState<
    Array<{
      index: number;
      start: number;
    }>
  >([]);

  return (
    <div className="flex-1 relative">
      {markLineList.map((item) => {
        return (
          <div
            key={item.start}
            className="absolute h-full bg-red-900 left-0 w-px"
            style={{ left: `${item.start}px` }}
          />
        );
      })}
      <ChartRenderView
        chartStore={rootStore.chartStore}
        setMarkLineList={setMarkLineList}
      />
    </div>
  );
};

export default ChartMainView;
