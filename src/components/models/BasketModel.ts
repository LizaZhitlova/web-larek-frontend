 import {IEventEmitter} from "../base/events"
interface IBasketModel {
	// items: Map<string, number>;
	items:Set<string>;
	add(id: string): void;
	remove(id: string): void;
}
export class BasketModel implements IBasketModel {
	// items: Map<string, number> = new Map();
	items:Set<string>= new Set()

	constructor(protected events: IEventEmitter) {}

	add(id: string): void {
		if(this.items.has(id)){
		return
		}
		this.items.add(id);
		this._changed()
	}

	remove(id: string): void {
		if (!this.items.has(id)) return;
		else {
			this.items.delete(id);
			this._changed()
		};
	}

	  // Проверяем, есть ли товар с таким ID в корзине
	  hasProduct(id: string): boolean {
        return this.items.has(id);
    }

	clear(): void {
		this.items.clear();
		this._changed();
	}

	protected _changed() {
		this.events.emit('basket:change', {
			items: Array.from(this.items.keys()),
		});
	}
}