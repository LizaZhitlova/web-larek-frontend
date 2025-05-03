
// типы для работы с это типы для работы  c json
export interface Product {
    id: string;
    title: string;
    description: string;
    image: string;
    category: string;
    price: number | null;
  }

  export interface ProductListResponse {
    total: number;
    items: Product[];
  }

  export type ProductItemResponse = Product;

  export interface OrderRequest {
    payment: 'online' | 'cash';
    email: string;
    phone: string;
    address: string;
    total: number;
    items: string[];
  }

  export interface OrderSuccessResponse {
    id: string;
    total: number;
  }

  export interface ErrorResponse {
    error: string;
  }
