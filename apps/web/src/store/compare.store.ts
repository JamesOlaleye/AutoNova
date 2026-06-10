import { create } from 'zustand';

const MAX = 3;

interface CompareStore {
  ids: string[];
  toggle: (id: string) => void;
  clear: () => void;
  has: (id: string) => boolean;
}

export const useCompareStore = create<CompareStore>((set, get) => ({
  ids: [],
  toggle(id) {
    const current = get().ids;
    if (current.includes(id)) {
      set({ ids: current.filter((v) => v !== id) });
    } else if (current.length < MAX) {
      set({ ids: [...current, id] });
    }
  },
  clear: () => set({ ids: [] }),
  has: (id) => get().ids.includes(id),
}));
