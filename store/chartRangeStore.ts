import { create } from 'zustand';

export type RangeSize = '1m' | '6m' | '1y' | 'all';

interface ChartRangeStore {
  rangeSize: RangeSize;
  setRangeSize: (rangeSize: RangeSize) => void;
}

export const useChartRangeStore = create<ChartRangeStore>((set) => ({
  rangeSize: '6m',
  setRangeSize: (rangeSize) => set({ rangeSize }),
}));
