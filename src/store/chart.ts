import { makeObservable, observable, action } from 'mobx';

class ChartStore {
  markList: Array<number> = [];

  rangeList: Array<[number, number]> = [];

  rootStore;

  constructor(rootStore) {
    this.rootStore = rootStore;
    makeObservable(this, {
      markList: observable,
      addMarkList: action,
    });
  }

  addMarkList(data: number) {
    this.markList.push(data);
  }

  addRange(data: [number, number]) {
    this.rangeList.push(data);
  }
}
export default ChartStore;
