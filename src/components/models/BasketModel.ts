 import {IEventEmitter} from "../base/events"
interface IBasketModel {
	items: Map<string, number>;
	add(id: string): void;
	remove(id: string): void;
}
export class BasketModel implements IBasketModel {
	items: Map<string, number> = new Map();

	constructor(protected events: IEventEmitter) {}

	add(id: string): void {
		this.items.set(id, (this.items.get(id) ?? 0) + 1);
		this._changed();
	}

	remove(id: string): void {
		if (!this.items.has(id)) return;

		const current = this.items.get(id)!;
		if (current > 1) {
			this.items.set(id, current - 1);
		} else {
			this.items.delete(id);
		}

		this._changed();
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