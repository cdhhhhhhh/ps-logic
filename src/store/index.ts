import ChartStore from './chart';

export class RootStore {
  chartStore: ChartStore;

  constructor() {
    this.chartStore = new ChartStore(this);
  }
}
const rootStore = new RootStore();
export default rootStore;
