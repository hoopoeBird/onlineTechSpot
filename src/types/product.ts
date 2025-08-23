export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  originalPrice?: number;
  default_image: any;
  category: string;
  rating: number;
  reviews: number;
  inStock: boolean;
  best_seller?: boolean;
  features: string[];
  product_category: any;
  documentId: String;
}

export interface CartItem {
  id: string;
  documentId: String;
  name: string;
  price: number;
  quantity: number;
  image: string;
}
