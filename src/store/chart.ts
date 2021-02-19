import { makeObservable, observable, action } from 'mobx';

export type MarkList = { time: number; value: number };
export type RangeListItem = { start: number; end: number; index: number };
class ChartStore {
  markList: Array<MarkList> = [];

  rangeList: Array<RangeListItem> = [];

  rootStore;

  constructor(rootStore: any) {
    this.rootStore = rootStore;
    makeObservable(this, {
      markList: observable,
      addMarkList: action,
    });
  }

  addMarkList(data: MarkList) {
    this.markList.push(data);
  }

  addRange(data: RangeListItem) {
    this.rangeList.push(data);
  }
}
export default ChartStore;
