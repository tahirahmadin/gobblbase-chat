export interface Product {
  id: string;
  title: string;
  image: string;
  price: string;
  currency: string;
  description: string;
  quantity: number;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface CartProps {
  items: Product[];
  onRemoveItem: (productId: string) => void;
  onCheckout?: () => void;
  totalItems: number;
  totalPrice: number;
  onBack: () => void;
  onOpenDrawer?: () => void;
}
