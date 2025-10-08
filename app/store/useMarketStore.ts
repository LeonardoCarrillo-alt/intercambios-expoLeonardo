import { create } from 'zustand';

interface MarketStore {
  selectedCategory: string | null;
  setCategory: (category: string | null) => void;
}

export const useMarketStore = create<MarketStore>((set) => ({
  selectedCategory: null,
  setCategory: (category) => set({ selectedCategory: category }),
}));
