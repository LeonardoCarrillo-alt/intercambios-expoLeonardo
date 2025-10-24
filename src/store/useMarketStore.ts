import { create } from "zustand";

export interface ProductItem {
  id: string;
  title: string;
  price?: number | null;
  image?: string;
  description?: string | null;
  condition?: string | null;
  category?: string | null;
  alias?: string | null;
  ownerId?: string | null;
  status?: "pending" | "approved" | "rejected" | "sold";
  createdAt?: any;
}

interface MarketStore {
  selectedCategory: string | null;
  products: ProductItem[];
  setCategory: (category: string | null) => void;
  setProducts: (items: ProductItem[]) => void;
  addProduct: (item: ProductItem) => void;
  updateProduct: (id: string, partial: Partial<ProductItem>) => void;
  removeProduct: (id: string) => void;
}

export const useMarketStore = create<MarketStore>((set) => ({
  selectedCategory: null,
  products: [],
  setCategory: (category) => set({ selectedCategory: category }),
  setProducts: (items) => set({ products: items }),
  addProduct: (item) =>
    set((state) => ({ products: [item, ...state.products] })),
  updateProduct: (id, partial) =>
    set((state) => ({
      products: state.products.map((p) => (p.id === id ? { ...p, ...partial } : p)),
    })),
  removeProduct: (id) =>
    set((state) => ({ products: state.products.filter((p) => p.id !== id) })),
}));
