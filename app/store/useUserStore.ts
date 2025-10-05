import { create } from 'zustand';

type User = {
    id: string;
    name: string;
    email: string;
    token: string;
}

const initialUser = null;

type UserStore = {
  user: User | null;
  setUser: (user: User | null) => void;
};

export const useUserStore = create<UserStore>((set) => ({
  user: initialUser,
  setUser: (user) => set({ user }),
  logout: () => set({ user: null })
}));