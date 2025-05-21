import {
	ensureElement, 
} from '../../utils/utils';
import {IEventEmitter} from "../base/events";
import{IProduct}from '../../types/index';
import { modal } from '../..';

// представление модалки карточки
export class PreviewView {
	protected title: HTMLElement;
	protected category: HTMLElement;
	protected description: HTMLElement;
	protected price: HTMLElement;
	protected image: HTMLImageElement;
	protected button: HTMLButtonElement;

	constructor(
		protected container: HTMLElement,
		protected events: IEventEmitter
	) {
		this.title = ensureElement('.card__title', this.container);
		this.category = ensureElement('.card__category', this.container);
		this.description = ensureElement('.card__text', this.container);
		this.price = ensureElement('.card__price', this.container);
		this.image = ensureElement<HTMLImageElement>(
			'.card__image',
			this.container
		);
		this.button = ensureElement<HTMLButtonElement>(
			'.card__button',
			this.container
		);

  }

	render(product: IProduct): HTMLElement {
		this.title.textContent = product.title ?? 'Без названия';
		this.category.textContent = product.category ?? '';
		this.description.textContent = product.description ?? '';
		this.price.textContent = product.price ? `${product.price} синапсов` : '—';
		this.image.src = product.image ?? '';
		this.image.alt = product.title ?? '';

		this.button.addEventListener('click', () => {
			if (product.id) {
				modal.close();
				this.events.emit('ul:basket-add', { id: product.id });
			}
		});

		return this.container;
	}
}