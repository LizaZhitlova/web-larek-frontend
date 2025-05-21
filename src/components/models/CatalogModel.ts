import{IProduct} from '../../types/index'
import {IEventEmitter} from "../base/events"

interface ICatalogModel {
	items: IProduct[];
	setItems(items: IProduct[]): void;
	getProduct(id: string): IProduct | undefined;
}

export class CatalogModel implements ICatalogModel {
	items: IProduct[] = [];

	constructor(protected events: IEventEmitter) {}

	setItems(items: IProduct[]) {
		this.items = items;
		this.events.emit('catalog:loaded', { items });
	}

	getProduct(id: string): IProduct | undefined {
		return this.items.find((item) => item.id === id);
	}
}
