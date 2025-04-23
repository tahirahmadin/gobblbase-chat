import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  addProduct,
  updateProduct,
  deleteProduct,
  getProducts,
} from "../lib/serverActions";
import { toast } from "react-hot-toast";

interface Product {
  _id?: string;
  title: string;
  image: string;
  price: string;
  currency: string;
  description: string;
  about?: string;
}

interface InventoryState {
  products: Product[];
  isLoading: boolean;
  error: string | null;
  selectedProduct: Product | null;
  isEditing: boolean;

  // Actions
  setProducts: (products: Product[]) => void;
  setSelectedProduct: (product: Product | null) => void;
  setIsEditing: (isEditing: boolean) => void;

  // CRUD Operations
  addProduct: (product: Omit<Product, "_id">, agentId: string) => Promise<void>;
  updateProduct: (product: Product, agentId: string) => Promise<void>;
  deleteProduct: (productId: string, agentId: string) => Promise<void>;
  fetchProducts: (agentId: string) => Promise<void>;
}

export const useInventoryStore = create<InventoryState>()(
  persist(
    (set, get) => ({
      products: [],
      selectedProduct: null,
      isLoading: false,
      error: null,
      isEditing: false,

      setProducts: (products) => set({ products }),
      setSelectedProduct: (product) => set({ selectedProduct: product }),
      setIsEditing: (isEditing) => set({ isEditing }),

      addProduct: async (product, agentId) => {
        try {
          set({ isLoading: true, error: null });
          const response = await addProduct({
            ...product,
            agentId,
            file: new File([], product.image), // This will be replaced with actual file in the component
            about: product.about || product.description, // Ensure about is always a string
          });
          const updatedProducts = await getProducts(agentId);
          set({ products: updatedProducts, isLoading: false });
          toast.success("Product added successfully");
        } catch (error) {
          set({ error: (error as Error).message, isLoading: false });
          toast.error("Failed to add product");
        }
      },

      updateProduct: async (product, agentId) => {
        try {
          set({ isLoading: true, error: null });
          await updateProduct({
            productId: product._id!,
            title: product.title,
            description: product.description,
            price: product.price,
            about: product.about || product.description, // Ensure about is always a string
            agentId,
          });
          const updatedProducts = await getProducts(agentId);
          set({ products: updatedProducts, isLoading: false });
          toast.success("Product updated successfully");
        } catch (error) {
          set({ error: (error as Error).message, isLoading: false });
          toast.error("Failed to update product");
        }
      },

      deleteProduct: async (productId, agentId) => {
        try {
          set({ isLoading: true, error: null });
          await deleteProduct(productId, agentId);
          const updatedProducts = await getProducts(agentId);
          set({ products: updatedProducts, isLoading: false });
          toast.success("Product deleted successfully");
        } catch (error) {
          set({ error: (error as Error).message, isLoading: false });
          toast.error("Failed to delete product");
        }
      },

      fetchProducts: async (agentId) => {
        try {
          set({ isLoading: true, error: null });
          const products = await getProducts(agentId);
          set({ products, isLoading: false });
        } catch (error) {
          set({ error: (error as Error).message, isLoading: false });
          toast.error("Failed to fetch products");
        }
      },
    }),
    {
      name: "inventory-storage",
    }
  )
);
