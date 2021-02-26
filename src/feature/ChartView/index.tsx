import React, { useRef, useState } from 'react';
import * as d3 from 'd3';
import { useMount } from 'ahooks';
import { observer } from 'mobx-react-lite';
import ChartStore from '../../store/chart';
import rootStore from '../../store';
import {
  axisFormatSecondMain,
  axisFormatSecondSubordination,
  getArrIndex,
  getDataCVS,
  getDigit,
  secondFormat,
} from '../../utils/axis';

async function renderView({ width, setMarkLineList, chartStore }) {
  // 基本配置
  const chartHeight = 100;
  let zoomToPxSecond = 1 / width;
  let chartInfoLeftWidth = 100;
  let chartWidth = width - chartInfoLeftWidth;

  const brushMinWidth = 30;
  const brushHeight = 30;
  const data = await getDataCVS();
  let currentRangeList: Array<any> = [];
  let chartViewList: Array<{ view: any; update: any }> = [];
  const xscale = d3
    .scaleLinear()
    .range([0, width])
    .domain([data[0]['Time [s]'], data[data.length - 1]['Time [s]']]);
  const maxAxisX = xscale
    .domain()
    .map(Math.abs)
    .reduce((a, b) => a + b);
  const yscale = d3.scaleLinear().range([0, chartHeight]).domain([0, 1]);
  let currentScale = xscale;
  const zoomToPx = {
    value: (secondFormat(1, 's', 'ms') / width) * 100,
    format: 'ms',
  };

  let realBrush: [number, number] = [0, width];
  const axisX = () => {
    const [start, end] = currentScale.ticks();
    // const currentDigit = getDigit(
    //   format(subtract(bignumber(end), bignumber(start)), {
    //     precision: 14,
    //   })
    // );
    const currentDigit = d3.max([getDigit(start), getDigit(end)]);
    if (currentDigit > 1) {
      return d3
        .axisTop(currentScale)
        .tickFormat((i) => {
          if (getDigit(i) !== currentDigit) {
            return axisFormatSecondMain(i);
          }
          return axisFormatSecondSubordination(i, currentDigit - 1);
        })
        .tickSizeOuter(0);
    }
    return d3
      .axisTop(currentScale)
      .tickFormat((i) => {
        return `${i}s`;
      })
      .tickSizeOuter(0);
  };
  const zoom = d3
    .zoom<SVGElement, any>()
    .scaleExtent([1, 10 ** 6])
    .translateExtent([
      [0, 0],
      [width, Infinity],
    ])
    .wheelDelta((event) => {
      return (
        -event.deltaY *
        (event.deltaMode === 1 ? 0.1 : event.deltaMode ? 1 : 0.06)
      );
    });
  const brush = d3.brushX().extent([
    [0, 0],
    [width, 200],
  ]);

  // DOM元素绑定顺序
  const mainView = d3.select('#svg');

  let axisXView = mainView
    .append('svg')
    .attr('id', 'axisSvg')
    .attr('class', 'top-0 sticky')
    .attr('width', width)
    .attr('height', 20);
  const gridView = d3
    .select('#svg-container')
    .append('svg')
    .attr('class', 'absolute top-0')
    .attr('style', 'z-index:-999')
    .attr('width', width)
    .attr('height', 900);
  const chartView = d3.select('#svg').append('div');
  const brushView = mainView
    .append('svg')
    .attr('width', width)
    .attr('height', brushHeight)
    .attr('class', 'sticky bottom-0')
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
      .attr('height', chartHeight);

    const currentPeriodLine = chartViewLine.append('line');
    const currentNextPeriodLine = chartViewLine.append('line');

    const line = d3
      .line<any>()
      .curve(d3.curveStepBefore)
      .defined((d) => !Number.isNaN(d.value))
      .x((d) => currentScale(d['Time [s]']))
      .y((d) => yscale(d[key]));
    chartViewLine
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
        } else {
          // 展示当前坐标属性
          const bisectDate = d3.bisector((d) => {
            return d['Time [s]'];
          }).right;
          const index = bisectDate(data, currentScale.invert(clientX));
          const startIndex = getArrIndex(
            data,
            index,
            data[index]['Channel 0'] === 1 ? 0 : 1,
            (value) => value['Channel 0'],
            'left'
          );
          const endIndex = getArrIndex(
            data,
            index,
            data[index]['Channel 0'] === 1 ? 0 : 1,
            (value) => value['Channel 0'],
            'right'
          );
          if (data[endIndex - 1]) {
            currentPeriodLine
              .attr('x1', currentScale(data[startIndex]['Time [s]']))
              .attr('y1', '10')
              .attr('x2', currentScale(data[endIndex - 1]['Time [s]']))
              .attr('y2', '10')
              .attr('stroke', 'black')
              .attr('stroke-width', '1');
          }

          if (data[endIndex] && data[endIndex]['Channel 0'] !== undefined) {
            const nextIndex = getArrIndex(
              data,
              endIndex,
              data[endIndex]['Channel 0'] === 1 ? 0 : 1,
              (value) => value['Channel 0'],
              'right'
            );
            currentNextPeriodLine
              .attr('x1', currentScale(data[startIndex]['Time [s]']))
              .attr('y1', '40')
              .attr('x2', currentScale(data[nextIndex - 1]['Time [s]']))
              .attr('y2', '40')
              .attr('stroke', 'black')
              .attr('stroke-width', '1');
          } else {
            currentNextPeriodLine
              .attr('x1', '0')
              .attr('y1', '0')
              .attr('x2', '0')
              .attr('y2', '0');
          }
        }
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
        return path.attr('d', line);
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
    axisXView.call(axisX());
    gridView.call(
      d3
        .axisBottom(currentScale)
        .tickFormat(() => '')
        .tickSizeInner(9999)
    );
    gridView.select('.domain').remove();

    chartViewList.forEach((chartViewItem) => {
      chartViewItem.update();
    });
    realBrush = [
      width * (currentScale.domain()[0] / maxAxisX),
      width * (currentScale.domain()[1] / maxAxisX),
    ];
    if (realBrush[1] - realBrush[0] > brushMinWidth) {
      brushView.call(brush.move, [
        width * (currentScale.domain()[0] / maxAxisX),
        width * (currentScale.domain()[1] / maxAxisX),
      ]);
    } else {
      const num = realBrush[1] - realBrush[0];
      const currentBrush = [
        realBrush[0] - (brushMinWidth - num) / 2,
        realBrush[1] + (brushMinWidth - num) / 2,
      ];
      if (currentBrush[1] >= width) {
        brushView.call(brush.move, [width - brushMinWidth, width]);
      } else if (currentBrush[0] <= 0) {
        brushView.call(brush.move, [0, brushMinWidth]);
      } else {
        brushView.call(brush.move, [currentBrush[0], currentBrush[1]]);
      }
    }

    updateMark();
    updateRange();
  };
  const init = () => {
    // TODO:mock data
    const list = Array.from({ length: 10 }, (_, index) => {
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
      zoomToPxSecond =
        (currentScale.domain()[1] - currentScale.domain()[0]) / width;
      update();
    });

    brush.on('brush', (event) => {
      // 保证不是联动的影像
      const s = event.selection;
      if (s && event.sourceEvent) {
        if (realBrush[1] - realBrush[0] > brushMinWidth) {
          chartView.call(
            zoom.transform,
            d3.zoomIdentity.scale(width / (s[1] - s[0])).translate(-s[0], 0)
          );
        } else if (s[1] === width) {
          chartView.call(
            zoom.transform,
            d3.zoomIdentity
              .scale(width / (realBrush[1] - realBrush[0]))
              .translate(-(width - (realBrush[1] - realBrush[0])), 0)
          );
        } else {
          chartView.call(
            zoom.transform,
            d3.zoomIdentity
              .scale(width / (realBrush[1] - realBrush[0]))
              .translate(-s[0], 0)
          );
        }
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
  const [height, setHeight] = useState(0);
  useMount(() => {
    const wrapper = ref.current;
    setHeight(wrapper.clientHeight);
    if (wrapper) {
      renderView({
        width: wrapper.clientWidth,
        setMarkLineList,
        chartStore,
      })
        .then()
        .catch();
    }
  });
  return (
    <div ref={ref} id="svg-container" className="h-full">
      <div style={{ height }} className="relative overflow-scroll" id="svg" />
    </div>
  );
});
const ChartMainView: React.FC = () => {
  const [markLineList, setMarkLineList] = useState<
    Array<{
      index: number;
      start: number;
    }>
  >([]);

  return (
    <div className="flex-1 relative overflow-scroll">
      {markLineList.map((item) => {
        return (
          <div
            key={item.start}
            className="absolute h-full bg-red-900 left-0 w-px "
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
