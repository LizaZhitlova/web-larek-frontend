
import{IProduct,IOrderRequest} from '../../types/index';
 
interface IOrderModel {
	payment: string;
	address: string;
	email: string;
	phone: string;
	items: string[];

	setField(field: keyof IOrderModel, value: string | string[]): void;
	getOrder(): IOrderRequest;
}

export class OrderModel implements IOrderModel {
	payment: 'online' | 'cash' | null = null;
	address = '';
	email = '';
	phone = '';
	items: string[] = [];

  constructor(private getProduct: (id: string) => IProduct | undefined) {}

	setField(field: keyof IOrderModel, value: any): void {
		this[field] = value;
	}

	getOrder(): IOrderRequest {
		return {
			payment: this.payment!,
			address: this.address,
			email: this.email,
			phone: this.phone,
			total: this.items.reduce((sum, id) => {
				const product = this.getProduct(id);
				return sum + (product?.price || 0);
			}, 0),
			items: this.items,
		};
	}

	clear(): void {
		this.payment = null;
		this.address = '';
		this.email = '';
		this.phone = '';
		this.items = [];
	}
}