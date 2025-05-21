
// типы для работы с это типы для работы  c json

// IProduct - интерфейс, хранит типы данных карточки товара 
export interface IProduct {
    id: string;
    title: string;
    description: string;
    image: string;
    category: string;
    price: number | null;
  }

  // IProductListResponse - интерфес хранит типы данных, которые выводятся на страницу 
  export interface IProductListResponse {
    total: number;
    items: IProduct[];
  }

  export type ProductItemResponse = IProduct;

  //IOrderRequest хранит типы пользовательских данных 
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
  
  export interface IView {
  render(data?: object): HTMLElement;
   }