import {
	ensureElement,
	setElementData,
} from '../../utils/utils';

import{IView,IProduct}from '../../types/index';
import {IEventEmitter} from "../base/events"

const categoryClassMap: Record<string, string> = {
	'софт-скил': 'card__category_soft',
	'хард-скил': 'card__category_hard',
	другое: 'card__category_other',
	дополнительное: 'card__category_additional',
	кнопка: 'card__category_button',
};

export class CardView implements IView {
	protected title: HTMLElement;
	protected category: HTMLElement;
	protected price: HTMLElement;
	protected image: HTMLImageElement;

	constructor(protected container: HTMLElement, protected events: IEventEmitter) {
		this.title = ensureElement('.card__title', this.container);
		this.category = ensureElement('.card__category', this.container);
		this.price = ensureElement('.card__price', this.container);
		this.image = ensureElement<HTMLImageElement>('.card__image', this.container);
	}

	render(product: IProduct): HTMLElement {
		this.title.textContent = product.title;
		this.category.textContent = product.category;
		this.price.textContent =
			product.price !== null ? `${product.price} синапсов` : 'Бесценно';
		this.image.src = product.image;
		this.image.alt = product.title;

    this.container.addEventListener('click', () => {
			this.events.emit('product:select', { id: product.id });
		});

		setElementData(this.container, { id: product.id });

		const normalizedCategory = product.category.toLowerCase().trim();
		const categoryModifier =
			categoryClassMap[normalizedCategory] || 'card__category_other';

		this.category.className = `card__category ${categoryModifier}`;

		return this.container;
	}
}
