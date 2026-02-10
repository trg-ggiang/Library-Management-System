import { create } from "zustand";
import { persist } from "zustand/middleware";

const useCartStore = create(
  persist(
    (set, get) => ({
      items: [], // { bookId, title, author, coverUrl, quantity }

      addItem: (book, qty = 1) => {
        const quantity = Math.min(5, Math.max(1, Number(qty) || 1));
        const cur = get().items.slice();
        const idx = cur.findIndex((x) => x.bookId === book.id);

        if (idx >= 0) {
          cur[idx] = { ...cur[idx], quantity: Math.min(5, cur[idx].quantity + quantity) };
        } else {
          cur.unshift({
            bookId: book.id,
            title: book.title,
            author: book.author,
            coverUrl: book.coverUrl || "",
            quantity,
          });
        }
        set({ items: cur });
      },

      removeItem: (bookId) => set({ items: get().items.filter((x) => x.bookId !== bookId) }),

      setQty: (bookId, qty) => {
        const quantity = Math.min(5, Math.max(1, Number(qty) || 1));
        set({
          items: get().items.map((x) => (x.bookId === bookId ? { ...x, quantity } : x)),
        });
      },

      clear: () => set({ items: [] }),
    }),
    { name: "cart-storage" }
  )
);

export default useCartStore;
