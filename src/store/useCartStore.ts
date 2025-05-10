import { create } from "zustand";
import { persist } from "zustand/middleware";
import { getMainProducts } from "../lib/serverActions";

interface Product {
  images: string[];
  agentId: string;
  category: string;
  ctaButton: string;
  description: string;
  fileFormat: string[];
  isPaused: boolean;
  name: string;
  price: number | null;
  quantity: number;
  quantityType: string;
  quantityUnlimited: boolean;
  slots: any[];
  type: string;
  _id: string;
}

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
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      products: [],
      isProductsLoading: false,
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
        let response = await getMainProducts(inputAgentId);
        console.log(response);
        set({ products: response });
      },
    }),
    {
      name: "cart-storage",
    }
  )
);
