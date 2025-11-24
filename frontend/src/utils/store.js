import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(
  persist(
    (set) => ({
      token: null,
      user: null,
      setToken: (token) => set({ token }),
      setUser: (user) => set({ user }),
      logout: () => set({ token: null, user: null }),
    }),
    {
      name: 'auth-storage',
    }
  )
);

export const useInventoryStore = create((set) => ({
  items: [],
  selectedItem: null,
  setItems: (items) => set({ items }),
  setSelectedItem: (item) => set({ selectedItem: item }),
  addItem: (item) => set((state) => ({ items: [...state.items, item] })),
  updateItem: (id, updates) =>
    set((state) => ({
      items: state.items.map((item) =>
        item.id === id ? { ...item, ...updates } : item
      ),
    })),
  removeItem: (id) =>
    set((state) => ({
      items: state.items.filter((item) => item.id !== id),
    })),
}));

export const usePalletStore = create((set) => ({
  pallets: [],
  selectedPallet: null,
  setPallets: (pallets) => set({ pallets }),
  setSelectedPallet: (pallet) => set({ selectedPallet: pallet }),
  addPallet: (pallet) => set((state) => ({ pallets: [...state.pallets, pallet] })),
  updatePallet: (id, updates) =>
    set((state) => ({
      pallets: state.pallets.map((pallet) =>
        pallet.id === id ? { ...pallet, ...updates } : pallet
      ),
    })),
  removePallet: (id) =>
    set((state) => ({
      pallets: state.pallets.filter((pallet) => pallet.id !== id),
    })),
}));
