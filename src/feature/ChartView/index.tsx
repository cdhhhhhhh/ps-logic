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
import { DropTargetMonitor, useDrop } from 'react-dnd';

interface RenderViewConfig {
  width: number;
  setMarkLineList: any;
  chartStore: any;
  chartHeight: number;
  brushMinWidth: number;
  brushHeight: number;
  data: any;
  xKey: Array<string>;
  yKey: string;
  lineColors: Array<string>;
}

async function renderView(config: RenderViewConfig) {
  const {
    width,
    setMarkLineList,
    chartStore,
    chartHeight,
    brushMinWidth,
    brushHeight,
    data,
    xKey,
    yKey,
    lineColors,
  } = config;
  // 基本配置
  let zoomToPxSecond = 1 / width;

  // const brushMinWidth = 30;
  // const brushHeight = 30;
  let currentRangeList: Array<any> = [];
  let chartViewList: Array<{ view: any; update: any }> = [];
  const xscale = d3
    .scaleLinear()
    .range([0, width])
    .domain([data[0][yKey], data[data.length - 1][yKey]]);
  const maxAxisX = xscale
    .domain()
    .map(Math.abs)
    .reduce((a, b) => a + b);
  const yscale = d3
    .scaleLinear()
    .range([0, chartHeight - 20])
    .domain([0, 1]);
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
    .select('#svg')
    .append('svg')
    .attr('class', 'absolute top-0')
    .attr('style', 'z-index:-999')
    .attr('width', width)
    .attr('height', chartHeight * xKey.length);
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
      .attr('width', width)
      .attr('height', chartHeight);

    const currentPeriodLine = chartViewLine.append('line');
    const currentNextPeriodLine = chartViewLine.append('line');

    const line = d3
      .line<any>()
      .curve(d3.curveStepBefore)
      .defined((d) => !Number.isNaN(d.value))
      .x((d) => currentScale(d[yKey]))
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
        const { offsetX } = event;
        if (brushIng.state) {
          brushIng.rect.attr('width', offsetX - brushIng.start);
        } else {
          // 展示当前坐标属性
          const bisectDate = d3.bisector((d) => {
            return d[yKey];
          }).right;
          const index = bisectDate(data, currentScale.invert(offsetX));
          const startIndex = getArrIndex(
            data,
            index,
            data[index][key] === 1 ? 0 : 1,
            (value) => value[key],
            'left'
          );
          const endIndex = getArrIndex(
            data,
            index,
            data[index][key] === 1 ? 0 : 1,
            (value) => value[key],
            'right'
          );
          if (data[endIndex - 1]) {
            currentPeriodLine
              .attr('x1', currentScale(data[startIndex][yKey]))
              .attr('y1', '10')
              .attr('x2', currentScale(data[endIndex - 1][yKey]))
              .attr('y2', '10')
              .attr('stroke', 'black')
              .attr('stroke-width', '1');
          }

          if (data[endIndex] && data[endIndex][key] !== undefined) {
            const nextIndex = getArrIndex(
              data,
              endIndex,
              data[endIndex][key] === 1 ? 0 : 1,
              (value) => value[key],
              'right'
            );
            currentNextPeriodLine
              .attr('x1', currentScale(data[startIndex][yKey]))
              .attr('y1', '40')
              .attr('x2', currentScale(data[nextIndex - 1][yKey]))
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
      .attr('stroke', lineColors[index])
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
    chartViewList = xKey.map((key, index) => {
      const temp = createChartView(key, index);
      temp.update();
      return temp;
    });
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
  const [barWidth, setBarWidth] = useState(100);
  const [chartWidth, setChartWidth] = useState(0);
  const xkeys = [
    'Channel 0',
    'Channel 1',
    'Channel 0',
    'Channel 1',
    'Channel 0',
    'Channel 1',
    'Channel 0',
    'Channel 1',
    'Channel 0',
    'Channel 1',
    'Channel 0',
    'Channel 1',
    'Channel 0',
    'Channel 1',
  ];
  useMount(async () => {
    const wrapper = ref.current;
    const data = await getDataCVS();

    if (wrapper) {
      setHeight(wrapper.clientHeight);
      setChartWidth(barWidth - wrapper.clientWidth);
      renderView({
        width: wrapper.clientWidth - barWidth,
        setMarkLineList,
        chartStore,
        data,
        chartHeight: 100,
        brushHeight: 30,
        brushMinWidth: 30,
        xKey: xkeys,
        yKey: 'Time [s]',
        lineColors: [...d3.schemeCategory10],
      })
        .then()
        .catch();
    }
  });

  const [{ handlerId }, drop] = useDrop({
    accept: ItemTypes.CARD,
    collect(monitor) {
      return {
        handlerId: monitor.getHandlerId(),
      }
    },
    hover(item, monitor: DropTargetMonitor) {
      if (!ref.current) {
        return
      }
      const dragIndex = item.index
      const hoverIndex = index

      // Don't replace items with themselves
      if (dragIndex === hoverIndex) {
        return
      }

      // Determine rectangle on screen
      const hoverBoundingRect = ref.current?.getBoundingClientRect()

      // Get vertical middle
      const hoverMiddleY =
        (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2

      // Determine mouse position
      const clientOffset = monitor.getClientOffset()

      // Get pixels to the top
      const hoverClientY = (clientOffset as XYCoord).y - hoverBoundingRect.top

      // Only perform the move when the mouse has crossed half of the items height
      // When dragging downwards, only move when the cursor is below 50%
      // When dragging upwards, only move when the cursor is above 50%

      // Dragging downwards
      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
        return
      }

      // Dragging upwards
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
        return
      }

      // Time to actually perform the action
      moveCard(dragIndex, hoverIndex)

      // Note: we're mutating the monitor item here!
      // Generally it's better to avoid mutations,
      // but it's good here for the sake of performance
      // to avoid expensive index searches.
      item.index = hoverIndex
    },
  })

  const [{ isDragging }, drag] = useDrag({
    item: { type: ItemTypes.CARD, id, index },
    collect: (monitor: any) => ({
      isDragging: monitor.isDragging(),
    }),
  })


  return (
    <div ref={ref} id="svg-container" className="h-full overflow-scroll flex">
      <div style={{ width: '100px', height }}>
        <div className="bg-gray-300 border-b" style={{ height: '20px' }} />
        {xkeys.map((key, index) => {
          return (
            <div
              key={key}
              className="flex justify-center items-center bg-gray-300 text-sm"
              style={{
                height: '100px',
                borderLeft: `5px solid ${d3.schemeCategory10[index]}`,
              }}
            >
              {key}
            </div>
          );
        })}
      </div>
      <div style={{ height }} className="relative" id="svg" />
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
