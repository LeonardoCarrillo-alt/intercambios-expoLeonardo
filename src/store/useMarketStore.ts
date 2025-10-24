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

interface MarketState {
  selectedCategory: string | null;
  products: ProductItem[];
  searchQuery: string;
  setSelectedCategory: (category: string | null) => void;
  setProducts: (items: ProductItem[]) => void;
  addProduct: (item: ProductItem) => void;
  updateProduct: (id: string, partial: Partial<ProductItem>) => void;
  removeProduct: (id: string) => void;
  setSearchQuery: (query: string) => void;
}

export const useMarketStore = create<MarketState>((set) => ({
  selectedCategory: null,
  products: [],
  searchQuery: "",
  setSelectedCategory: (category) => set({ selectedCategory: category }),
  setProducts: (items) => set({ products: items }),
  addProduct: (item) =>
    set((state) => ({ products: [item, ...state.products] })),
  updateProduct: (id, partial) =>
    set((state) => ({
      products: state.products.map((p) => (p.id === id ? { ...p, ...partial } : p)),
    })),
  removeProduct: (id) =>
    set((state) => ({ products: state.products.filter((p) => p.id !== id) })),
  setSearchQuery: (query) => set({ searchQuery: query }),
}));
