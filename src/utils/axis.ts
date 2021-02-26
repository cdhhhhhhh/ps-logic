import * as d3 from 'd3';
import { format } from 'mathjs';

export async function getDataCVS(): Promise<
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
export function getDigit(n: number): number {
  if (n.toString().split('.').length > 1) {
    return n.toString().split('.')[1].length;
  }
  return 0;
}
export function getArrIndex(
  arr: Array<any>,
  start: number,
  value: number,
  fun: any,
  direction: 'left' | 'right'
): number {
  const index = NaN;
  let startIndex = start;
  while (arr[startIndex]) {
    if (fun(arr[startIndex]) === value) {
      return startIndex;
    }
    if (direction === 'left') {
      startIndex -= 1;
    } else {
      startIndex += 1;
    }
  }
  return index;
}
export function secondFormat(
  value: number,
  fromFormat: 'ms' | 'us' | 'ns' | 's',
  toFormat: 'ms' | 'us' | 'ns' | 's'
): number {
  const list = ['s', 'ms', 'us', 'ns'];
  const fromIndex = list.findIndex((i) => fromFormat === i);
  const toIndex = list.findIndex((i) => toFormat === i);
  return toIndex - fromIndex > 0
    ? Number(format(value * 1000 ** (toIndex - fromIndex), { precision: 14 }))
    : value / 1000 ** (fromIndex - toIndex);
}

export function axisFormatSecondMain(n: number): string {
  const num = getDigit(Math.abs(n));
  if (num >= 1 && num <= 3) {
    return `${n > 0 ? '' : '-'}${Number.parseInt(
      n.toString(),
      10
    )}s : ${secondFormat(
      Math.abs(Number.parseInt(n.toString(), 10) - n),
      's',
      'ms'
    )}ms`;
  }
  if (num > 3) {
    const ms = Number.parseInt(
      secondFormat(
        Math.abs(Number.parseInt(n.toString(), 10) - n),
        's',
        'ms'
      ).toString(),
      10
    );
    let us =
      secondFormat(Math.abs(n), 's', 'us') -
      secondFormat(ms, 'ms', 'us') -
      secondFormat(Math.abs(Number.parseInt(n.toString(), 10)), 's', 'us');
    if (ms === 0) {
      us = secondFormat(Math.abs(n), 's', 'us');
    }

    return `${n > 0 ? '' : '-'}${Number.parseInt(
      n.toString(),
      10
    )}s : ${ms}ms : ${us}us`;
  }

  return '0 s';
}
export function axisFormatSecondSubordination(
  n: number,
  index: number
): string {
  const num = getDigit(Math.abs(n));
  if (num > 1 && num <= 4) {
    const ms = secondFormat(
      Math.abs(Number.parseInt(n.toString(), 10) - n),
      's',
      'ms'
    )
      .toString()
      .slice(index);
    return `${ms}ms`;
  }
  if (num > 4) {
    const us = secondFormat(
      Math.abs(Number.parseInt(n.toString(), 10) - n),
      's',
      'us'
    )
      .toString()
      .slice(index);
    return `${us}us`;
  }
  return '0';
}
