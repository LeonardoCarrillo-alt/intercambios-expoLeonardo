import { create } from 'zustand';
import { nanoid } from 'nanoid/non-secure';

export type MarketItem = {
  id: string;
  title: string;
  image: string; 
  category: string;
  type: 'venta' | 'intercambio' | string;
  condition: string;
  carrera?: string;
  price?: number | null;
  description: string;
  alias: string;
  createdAt?: string;
};

type MarketStore = {
  items: MarketItem[];
  getItemById: (id: string) => MarketItem | undefined;
  addItem: (item: Omit<MarketItem, 'id' | 'createdAt'>) => void;
};

const makeMockItem = (i: number): MarketItem => ({
  id: `${i + 1}`,
  title: `Producto ${i + 1}`,
  image: `https://via.placeholder.com/600x400.png?text=producto${i + 1}`,
  category: ['Electrónica', 'Libros', 'Ropa', 'Accesorios'][i % 4],
  type: i % 3 === 0 ? 'intercambio' : 'venta',
  condition: i % 2 === 0 ? 'Nuevo' : 'Usado - Bueno',
  carrera: i % 5 === 0 ? 'Ingeniería' : undefined,
  price: i % 3 === 0 ? null : (10 + i) * 1,
  description: `Descripción detallada del producto ${i + 1}. Está en buen estado y disponible para intercambio o venta según se indique.`,
  alias: `usuario${(i % 6) + 1}`,
  createdAt: new Date().toISOString(),
});

export const useMarketStore = create<MarketStore>((set, get) => {
  const initial = Array.from({ length: 20 }).map((_, i) => makeMockItem(i));

  return {
    items: initial,
    getItemById: (id: string) => get().items.find((it) => it.id === id),
    addItem: (item) =>
      set((state) => ({
        items: [
          {
            ...item,
            id: nanoid(),
            createdAt: new Date().toISOString(),
          },
          ...state.items,
        ],
      })),
  };
});