
// типы для работы с это типы для работы  c json
export interface IProduct {
    id: string;
    title: string;
    description: string;
    image: string;
    category: string;
    price: number | null;
  }

  export interface IProductListResponse {
    total: number;
    items: IProduct[];
  }

  export type ProductItemResponse = IProduct;

  export interface IOrderRequest {
    payment: 'online' | 'cash';
    email: string;
    phone: string;
    address: string;
    total: number;
    items: string[];
  }

  export interface IOrderSuccessResponse {
    id: string;
    total: number;
  }

  export interface IErrorResponse {
    error: string;
  }
