import {
	cloneTemplate,
	ensureElement,
} from '../../utils/utils';
import {IEventEmitter} from "../base/events";

import{IView}from '../../types/index';
import{cardBasketTemplate} from '../..';

// Представление всей корзины
export class BasketView implements IView {
	protected list: HTMLElement;
	protected total: HTMLElement;
	protected button: HTMLButtonElement;

	constructor(
		protected container: HTMLElement,
		protected events: IEventEmitter
	) {
		this.list = ensureElement('.basket__list', this.container);
		this.total = ensureElement('.basket__price', this.container);
		this.button = ensureElement<HTMLButtonElement>(
			'.basket__button',
			this.container
		);

		this.button.addEventListener('click', () => {
			this.events.emit('basket:submit');
		});

		// Изначально кнопка неактивна
		this.button.disabled = true;
	}

	render(data: { items: { id: string; title: string; price: number }[] }) {
		const elements: HTMLElement[] = [];
		let total = 0;

		// Проверяем, есть ли товары в корзине
		const hasItems = data.items.length > 0;

		data.items.forEach((item, i) => {
			const template = cloneTemplate(cardBasketTemplate);

			const itemView = new BasketItemView(template, this.events);
			const el = itemView.render({ ...item, index: i + 1 });

			elements.push(el);
			total += item.price;
		});

		this.list.replaceChildren(...elements);
		this.total.textContent = `${total} синапсов`;

		// Устанавливаем состояние кнопки в зависимости от наличия товаров
		this.button.disabled = !hasItems;

		return this.container;
	}
}

// Представление одного товара в корзине
export class BasketItemView implements IView {
	protected title: HTMLSpanElement;
	protected price: HTMLSpanElement;
	protected index: HTMLSpanElement;
	protected removeButton: HTMLButtonElement;
	protected id: string | null = null;

	constructor(
		protected container: HTMLElement,
		protected events: IEventEmitter
	) {
		this.title = ensureElement('.card__title', this.container);
		this.price = ensureElement('.card__price', this.container);
		this.index = ensureElement('.basket__item-index', this.container);
		this.removeButton = ensureElement<HTMLButtonElement>(
			'.basket__item-delete',
			this.container
		);

		this.removeButton.addEventListener('click', () => {
			if (this.id) {
				this.events.emit('basket:basket-remove', { id: this.id });
			}
		});
	}

	render(data: {
		id: string;
		title: string;
		price: number;
		index: number;
	}): HTMLElement {
		this.id = data.id;
		this.title.textContent = data.title;
		this.price.textContent = `${data.price} синапсов`;
		this.index.textContent = String(data.index);
		return this.container;
	}
}