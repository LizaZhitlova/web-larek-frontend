//это класс апишки с методами

import {
    IProduct,
    IOrderRequest,
    IOrderSuccessResponse,
} from '../types/index'

import { Api, ApiListResponse } from './base/api'; 

export class WebLarekApi extends Api {
  readonly cdn: string;

  constructor(cdn: string, baseUrl: string, options?: RequestInit) {
    super(baseUrl, options);
    this.cdn = cdn;
  }

  getProducts(): Promise<ApiListResponse<IProduct>> {
    return this.get('/product')
      .then((data: ApiListResponse<IProduct>) => ({
        ...data,
        items: data.items.map(product => ({
          ...product,
          image: this.cdn + product.image.replace(".svg",".png")
        }))
      }));
  }

  getProductById(id: string): Promise<IProduct> {
    return this.get(`/product/${id}`)
      .then((product: IProduct) => ({
        ...product,
        image: this.cdn + product.image.replace(".svg",".png")
      }));
  }

  createOrder(order: IOrderRequest): Promise<IOrderSuccessResponse> {
    return this.post('/order', order) as Promise<IOrderSuccessResponse>;
  }
}