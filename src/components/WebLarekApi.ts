//это класс апишки с методами

import {
  Product,
  OrderRequest,
  OrderSuccessResponse,
} from '../types/index'

import { Api, ApiListResponse } from './base/api'; 

export class WebLarekApi extends Api {
  readonly cdn: string;

  constructor(cdn: string, baseUrl: string, options?: RequestInit) {
    super(baseUrl, options);
    this.cdn = cdn;
  }

  getProducts(): Promise<ApiListResponse<Product>> {
    return this.get('/product')
      .then((data: ApiListResponse<Product>) => ({
        ...data,
        items: data.items.map(product => ({
          ...product,
          image: this.cdn + product.image
        }))
      }));
  }

  getProductById(id: string): Promise<Product> {
    return this.get(`/product/${id}`)
      .then((product: Product) => ({
        ...product,
        image: this.cdn + product.image
      }));
  }

  createOrder(order: OrderRequest): Promise<OrderSuccessResponse> {
    return this.post('/order', order) as Promise<OrderSuccessResponse>;
  }
}