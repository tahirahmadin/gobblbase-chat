import { create } from "zustand";
import { persist } from "zustand/middleware";
import { getMainProductsForUser } from "../lib/serverActions";
import { Product } from "../types";

interface CartItem extends Product {
  quantity: number;
}

interface CartStore {
  products: Product[];
  items: CartItem[];
  addItem: (product: Product) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
  getProductsInventory: (inputAgentId: string) => Promise<void>;
  isProductsLoading: boolean;
  selectedProduct: Product | null;
  setSelectedProduct: (product: Product | null) => void;
  removeSelectedProduct: () => void;
  cartView: boolean;
  setCartView: (show: boolean) => void;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      products: [],
      selectedProduct: null,
      isProductsLoading: false,
      cartView: false,
      setCartView: (show: boolean) => set({ cartView: show }),
      setSelectedProduct: (product: Product | null) => {
        set({ selectedProduct: product });
      },
      removeSelectedProduct: () => {
        set({ selectedProduct: null });
      },
      addItem: (product) => {
        set((state) => {
          const existingItem = state.items.find(
            (item) => item._id === product._id
          );
          if (existingItem) {
            return {
              items: state.items.map((item) =>
                item._id === product._id
                  ? { ...item, quantity: item.quantity + 1 }
                  : item
              ),
            };
          }
          return {
            items: [...state.items, { ...product, quantity: 1 }],
          };
        });
      },
      removeItem: (productId) => {
        set((state) => ({
          items: state.items.filter((item) => item._id !== productId),
        }));
      },
      updateQuantity: (productId, quantity) => {
        if (quantity < 1) {
          get().removeItem(productId);
          return;
        }
        set((state) => ({
          items: state.items.map((item) =>
            item._id === productId ? { ...item, quantity } : item
          ),
        }));
      },
      clearCart: () => {
        set({ items: [] });
      },
      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },
      getTotalPrice: () => {
        return get().items.reduce(
          (total, item) =>
            total + (item.price ? item.price : 0) * item.quantity,
          0
        );
      },
      getProductsInventory: async (inputAgentId: string) => {
        let response = await getMainProductsForUser(inputAgentId);
        console.log(response);
        set({ products: response });
      },
    }),
    {
      name: "cart-storage",
    }
  )
);
