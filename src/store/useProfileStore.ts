import { create } from "zustand";

interface ProfileState {
  uid: string | null;
  displayName: string | null;
  isAdmin: boolean;
  loading: boolean;
  setProfile: (payload: { uid: string | null; displayName?: string | null; isAdmin?: boolean }) => void;
  clearProfile: () => void;
  setLoading: (value: boolean) => void;
}

export const useProfileStore = create<ProfileState>((set) => ({
  uid: null,
  displayName: null,
  isAdmin: false,
  loading: true,
  setProfile: ({ uid, displayName = null, isAdmin = false }) => set({ uid, displayName, isAdmin, loading: false }),
  clearProfile: () => set({ uid: null, displayName: null, isAdmin: false, loading: false }),
  setLoading: (value: boolean) => set({ loading: value }),
}));
