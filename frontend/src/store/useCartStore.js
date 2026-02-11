import { create } from "zustand";
import { persist } from "zustand/middleware";

const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],

      addItem: (book, qty = 1) => {
        const quantity = Math.min(5, Math.max(1, Number(qty) || 1));
        const cur = get().items.slice();
        const bookId = book?.id;
        if (!bookId) return;

        const borrowPricePerDay = Number(
          book?.borrowPricePerDay ??
            book?.pricePerDay ??
            book?.borrowFeePerDay ??
            book?.borrowPrice ??
            0
        );

        const idx = cur.findIndex((x) => x.bookId === bookId);

        if (idx >= 0) {
          const prev = cur[idx];
          cur[idx] = {
            ...prev,
            title: book?.title ?? prev.title,
            author: book?.author ?? prev.author,
            coverUrl: book?.coverUrl ?? prev.coverUrl,
            borrowPricePerDay: Number.isFinite(borrowPricePerDay)
              ? borrowPricePerDay
              : prev.borrowPricePerDay || 0,
            quantity: Math.min(5, (prev.quantity || 1) + quantity),
          };
        } else {
          cur.unshift({
            bookId,
            title: book?.title || "",
            author: book?.author || "",
            coverUrl: book?.coverUrl || "",
            borrowPricePerDay: Number.isFinite(borrowPricePerDay) ? borrowPricePerDay : 0,
            quantity,
          });
        }

        set({ items: cur });
      },

      removeItem: (bookId) =>
        set({ items: get().items.filter((x) => x.bookId !== bookId) }),

      setQty: (bookId, qty) => {
        const quantity = Math.min(5, Math.max(1, Number(qty) || 1));
        set({
          items: get().items.map((x) =>
            x.bookId === bookId ? { ...x, quantity } : x
          ),
        });
      },

      clear: () => set({ items: [] }),
    }),
    {
      name: "cart-storage",
      version: 2,
      migrate: (persisted, fromVersion) => {
        const state = persisted || {};
        const items = Array.isArray(state.items) ? state.items : [];
        return {
          ...state,
          items: items.map((x) => ({
            ...x,
            borrowPricePerDay: Number(x.borrowPricePerDay || 0),
          })),
        };
      },
    }
  )
);

export default useCartStore;
