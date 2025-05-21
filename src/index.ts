import { EventEmitter, IEventEmitter } from './components/base/events';
import { WebLarekApi } from './components/WebLarekApi';
import './scss/styles.scss';
import { API_URL, CDN_URL } from './utils/constants';
import { cloneTemplate, ensureElement } from './utils/utils';
import { IProduct } from './types/index';
import { Modal } from './components/common/Modal';
import { Page } from './components/Page';
import { BasketModel } from './components/models/BasketModel';
import { CatalogModel } from './components/models/CatalogModel';
import { OrderModel } from './components/models/OrderModel';
import { OrderView, ContactsView, SuccessView } from './components/view/Order';
import { BasketView } from './components/view/Basket';
import { CardView } from './components/view/Card';
import{PreviewView} from './components/view/Preview';

// const categoryClassMap: Record<string, string> = {
// 	'софт-скил': 'card__category_soft',
// 	'хард-скил': 'card__category_hard',
// 	другое: 'card__category_other',
// 	дополнительное: 'card__category_additional',
// 	кнопка: 'card__category_button',
// };

const events = new EventEmitter();
const api = new WebLarekApi(CDN_URL, API_URL);

// Чтобы мониторить все события, для отладки
events.onAll(({ eventName, data }) => {
	console.log(eventName, data);
});

// Все шаблоны
const cardCatalogTemplate = ensureElement<HTMLTemplateElement>('#card-catalog');
const cardPreviewTemplate = ensureElement<HTMLTemplateElement>('#card-preview');
const basketTemplate = ensureElement<HTMLTemplateElement>('#basket');
const orderTemplate = ensureElement<HTMLTemplateElement>('#order');
const contactsTemplate = ensureElement<HTMLTemplateElement>('#contacts');
const successTemplate = ensureElement<HTMLTemplateElement>('#success');
export const cardBasketTemplate =
	ensureElement<HTMLTemplateElement>('#card-basket');

// Глобальные контейнеры
const page = new Page(document.body, events);
export const modal = new Modal(
	ensureElement<HTMLElement>('#modal-container'),
	events
);

//#region Interfaces
// interface ICatalogModel {
// 	items: IProduct[];
// 	setItems(items: IProduct[]): void;
// 	getProduct(id: string): IProduct | undefined;
// }

// interface IBasketModel {
// 	items: Map<string, number>;
// 	add(id: string): void;
// 	remove(id: string): void;
// }

// interface IEventEmitter {
// 	emit(event: string, data?: unknown): void;
// 	on(event: string, handler: (data?: unknown) => void): void;
// }

// interface IView {
// 	render(data?: object): HTMLElement;
// }

// interface IOrderModel {
// 	payment: string;
// 	address: string;
// 	email: string;
// 	phone: string;
// 	items: string[];

// 	setField(field: keyof IOrderModel, value: string | string[]): void;
// 	getOrder(): IOrderRequest;
// }

//#endregion

//#region Модели ---------------------------------------------------------------------------------------------------------------------------------

// class CatalogModel implements ICatalogModel {
// 	items: IProduct[] = [];

// 	constructor(protected events: IEventEmitter) {}

// 	setItems(items: IProduct[]) {
// 		this.items = items;
// 		this.events.emit('catalog:loaded', { items });
// 	}

// 	getProduct(id: string): IProduct | undefined {
// 		return this.items.find((item) => item.id === id);
// 	}
// }

// class BasketModel implements IBasketModel {
// 	items: Map<string, number> = new Map();

// 	constructor(protected events: IEventEmitter) {}

// 	add(id: string): void {
// 		this.items.set(id, (this.items.get(id) ?? 0) + 1);
// 		this._changed();
// 	}

// 	remove(id: string): void {
// 		if (!this.items.has(id)) return;

// 		const current = this.items.get(id)!;
// 		if (current > 1) {
// 			this.items.set(id, current - 1);
// 		} else {
// 			this.items.delete(id);
// 		}

// 		this._changed();
// 	}

// 	clear(): void {
// 		this.items.clear();
// 		this._changed();
// 	}

// 	protected _changed() {
// 		this.events.emit('basket:change', {
// 			items: Array.from(this.items.keys()),
// 		});
// 	}
// }

// class OrderModel implements IOrderModel {
// 	payment: 'online' | 'cash' | null = null;
// 	address = '';
// 	email = '';
// 	phone = '';
// 	items: string[] = [];

//   constructor(private getProduct: (id: string) => IProduct | undefined) {}

// 	setField(field: keyof IOrderModel, value: any): void {
// 		this[field] = value;
// 	}

// 	getOrder(): IOrderRequest {
// 		return {
// 			payment: this.payment!,
// 			address: this.address,
// 			email: this.email,
// 			phone: this.phone,
// 			total: this.items.reduce((sum, id) => {
// 				const product = this.getProduct(id);
// 				return sum + (product?.price || 0);
// 			}, 0),
// 			items: this.items,
// 		};
// 	}

// 	clear(): void {
// 		this.payment = null;
// 		this.address = '';
// 		this.email = '';
// 		this.phone = '';
// 		this.items = [];
// 	}
// }

//#endregion

//#region Представления -----------------------------------------------------------------------------------------------------

//представление карточки
// class CardView implements IView {
// 	protected title: HTMLElement;
// 	protected category: HTMLElement;
// 	protected price: HTMLElement;
// 	protected image: HTMLImageElement;

// 	constructor(protected container: HTMLElement, protected events: IEventEmitter) {
// 		this.title = ensureElement('.card__title', this.container);
// 		this.category = ensureElement('.card__category', this.container);
// 		this.price = ensureElement('.card__price', this.container);
// 		this.image = ensureElement<HTMLImageElement>('.card__image', this.container);
// 	}

// 	render(product: IProduct): HTMLElement {
// 		this.title.textContent = product.title;
// 		this.category.textContent = product.category;
// 		this.price.textContent =
// 			product.price !== null ? `${product.price} синапсов` : 'Бесценно';
// 		this.image.src = product.image;
// 		this.image.alt = product.title;

//     this.container.addEventListener('click', () => {
// 			this.events.emit('product:select', { id: product.id });
// 		});

// 		setElementData(this.container, { id: product.id });

// 		const normalizedCategory = product.category.toLowerCase().trim();
// 		const categoryModifier =
// 			categoryClassMap[normalizedCategory] || 'card__category_other';

// 		this.category.className = `card__category ${categoryModifier}`;

// 		return this.container;
// 	}
// }

// // представление модалки карточки
// class PreviewView {
// 	protected title: HTMLElement;
// 	protected category: HTMLElement;
// 	protected description: HTMLElement;
// 	protected price: HTMLElement;
// 	protected image: HTMLImageElement;
// 	protected button: HTMLButtonElement;

// 	constructor(
// 		protected container: HTMLElement,
// 		protected events: IEventEmitter
// 	) {
// 		this.title = ensureElement('.card__title', this.container);
// 		this.category = ensureElement('.card__category', this.container);
// 		this.description = ensureElement('.card__text', this.container);
// 		this.price = ensureElement('.card__price', this.container);
// 		this.image = ensureElement<HTMLImageElement>(
// 			'.card__image',
// 			this.container
// 		);
// 		this.button = ensureElement<HTMLButtonElement>(
// 			'.card__button',
// 			this.container
// 		);
// 	}

// 	render(product: IProduct): HTMLElement {
// 		this.title.textContent = product.title ?? 'Без названия';
// 		this.category.textContent = product.category ?? '';
// 		this.description.textContent = product.description ?? '';
// 		this.price.textContent = product.price ? `${product.price} синапсов` : '—';
// 		this.image.src = product.image ?? '';
// 		this.image.alt = product.title ?? '';

// 		this.button.addEventListener('click', () => {
// 			if (product.id) {
// 				modal.close();
// 				this.events.emit('ul:basket-add', { id: product.id });
// 			}
// 		});

// 		return this.container;
// 	}
// }

// // Представление всей корзины
// class BasketView implements IView {
// 	protected list: HTMLElement;
// 	protected total: HTMLElement;
// 	protected button: HTMLButtonElement;

// 	constructor(
// 		protected container: HTMLElement,
// 		protected events: IEventEmitter
// 	) {
// 		this.list = ensureElement('.basket__list', this.container);
// 		this.total = ensureElement('.basket__price', this.container);
// 		this.button = ensureElement<HTMLButtonElement>(
// 			'.basket__button',
// 			this.container
// 		);

// 		this.button.addEventListener('click', () => {
// 			this.events.emit('basket:submit');
// 		});
// 	}

// 	render(data: { items: { id: string; title: string; price: number }[] }) {
// 		const elements: HTMLElement[] = [];
// 		let total = 0;

// 		data.items.forEach((item, i) => {
// 			const template = cloneTemplate(cardBasketTemplate);

// 			const itemView = new BasketItemView(template, this.events);
// 			const el = itemView.render({ ...item, index: i + 1 });

// 			elements.push(el);
// 			total += item.price;
// 		});

// 		this.list.replaceChildren(...elements);
// 		this.total.textContent = `${total} синапсов`;

// 		return this.container;
// 	}
// }

// // Представление одного товара в корзине
// class BasketItemView implements IView {
// 	protected title: HTMLSpanElement;
// 	protected price: HTMLSpanElement;
// 	protected index: HTMLSpanElement;
// 	protected removeButton: HTMLButtonElement;
// 	protected id: string | null = null;

// 	constructor(
// 		protected container: HTMLElement,
// 		protected events: IEventEmitter
// 	) {
// 		this.title = ensureElement('.card__title', this.container);
// 		this.price = ensureElement('.card__price', this.container);
// 		this.index = ensureElement('.basket__item-index', this.container);
// 		this.removeButton = ensureElement<HTMLButtonElement>(
// 			'.basket__item-delete',
// 			this.container
// 		);

// 		this.removeButton.addEventListener('click', () => {
// 			if (this.id) {
// 				this.events.emit('basket:basket-remove', { id: this.id });
// 			}
// 		});
// 	}

// 	render(data: {
// 		id: string;
// 		title: string;
// 		price: number;
// 		index: number;
// 	}): HTMLElement {
// 		this.id = data.id;
// 		this.title.textContent = data.title;
// 		this.price.textContent = `${data.price} синапсов`;
// 		this.index.textContent = String(data.index);
// 		return this.container;
// 	}
// }

// class OrderView {
// 	private addressInput: HTMLInputElement;
// 	private buttons: HTMLButtonElement[];
// 	private submitButton: HTMLButtonElement;

// 	private payment: string | null = null;
// 	private address = '';

// 	constructor(private container: HTMLElement, private events: IEventEmitter) {
// 		this.addressInput = ensureElement<HTMLInputElement>(
// 			'.form__input',
// 			this.container
// 		);
// 		this.buttons = ensureAllElements<HTMLButtonElement>(
// 			'.button_alt',
// 			this.container
// 		);
// 		this.submitButton = ensureElement<HTMLButtonElement>(
// 			'.order__button',
// 			this.container
// 		);

// 		// Обработчик выбора способа оплаты
// 		this.buttons.forEach((btn) => {
// 			btn.addEventListener('click', () => {
// 				const payment = btn.name === 'card' ? 'online' : 'cash';
// 				this.payment = payment;
// 				this.events.emit('order:payment', { payment });
// 				this.updateButtonsState(btn);
// 				this.checkValidity();
// 			});
// 		});

// 		// Обработчик ввода адреса
// 		this.addressInput.addEventListener('input', () => {
// 			this.address = this.addressInput.value.trim();
// 			this.events.emit('order:address', { address: this.address });
// 			this.checkValidity();
// 		});

// 		// Обработчик кнопки «Далее»
// 		this.submitButton.addEventListener('click', (event) => {
// 			event.preventDefault();
// 			this.events.emit('order:next');
// 		});

// 		this.submitButton.disabled = true; // по умолчанию отключена
// 	}

// 	// Подсвечивает выбранную кнопку оплаты
// 	private updateButtonsState(activeBtn: HTMLButtonElement) {
// 		this.buttons.forEach((btn) => {
// 			btn.classList.toggle('button_alt-active', btn === activeBtn);
// 		});
// 	}

// 	// Валидация — адрес не пустой и способ оплаты выбран
// 	private checkValidity() {
// 		const isValid = this.payment !== null && this.address.length > 0;
// 		this.submitButton.disabled = !isValid;
// 	}

// 	render(): HTMLElement {
// 		return this.container;
// 	}
// }

// class ContactsView {
// 	private emailInput: HTMLInputElement;
// 	private phoneInput: HTMLInputElement;
// 	private submitButton: HTMLButtonElement;
// 	private email = '';
// 	private phone = '';

// 	constructor(private container: HTMLElement, private events: IEventEmitter) {
// 		this.emailInput = ensureElement<HTMLInputElement>(
// 			'.form__input[name="email"]',
// 			this.container
// 		);
// 		this.phoneInput = ensureElement<HTMLInputElement>(
// 			'.form__input[name="phone"]',
// 			this.container
// 		);
// 		this.submitButton = ensureElement<HTMLButtonElement>(
// 			'button[type="submit"]',
// 			this.container
// 		);

// 		this.emailInput.addEventListener('input', () => {
// 			this.email = this.emailInput.value.trim();
// 			this.events.emit('order:email', { email: this.email });
// 			this.checkValidity();
// 		});

// 		this.phoneInput.addEventListener('input', () => {
// 			this.phone = this.phoneInput.value.trim();
// 			this.events.emit('order:phone', { phone: this.phone });
// 			this.checkValidity();
// 		});

// 		this.submitButton.addEventListener('click', (e) => {
// 			e.preventDefault();
// 			this.events.emit('order:submit');
// 		});

// 		this.submitButton.disabled = true;
// 	}

// 	private checkValidity() {
// 		const isValid = this.email.length > 0 && this.phone.length > 0;
// 		this.submitButton.disabled = !isValid;
// 	}

// 	render(): HTMLElement {
// 		return this.container;
// 	}
// }

// class SuccessView {
// 	private title: HTMLElement;
// 	private description: HTMLElement;
// 	private closeButton: HTMLButtonElement;

// 	constructor(private container: HTMLElement, private events: IEventEmitter) {
// 		this.title = ensureElement('.order-success__title', this.container);
// 		this.description = ensureElement(
// 			'.order-success__description',
// 			this.container
// 		);
// 		this.closeButton = ensureElement<HTMLButtonElement>(
// 			'.order-success__close',
// 			this.container
// 		);

// 		this.closeButton.addEventListener('click', () => {
// 			this.events.emit('success:done');
// 		});
// 	}

// 	render(data: { total: number }) {
// 		this.title.textContent = 'Заказ оформлен';
// 		this.description.textContent = `Списано ${data.total} синапсов`;
// 		return this.container;
// 	}
// }

//#endregion

const catalogModel = new CatalogModel(events);
const basketModel = new BasketModel(events);
const basketView = new BasketView(cloneTemplate(basketTemplate), events);
const orderModel = new OrderModel(catalogModel.getProduct.bind(catalogModel));

// #region Обработка событий---------------------------------------
// Блокируем прокрутку страницы если открыта модалка
events.on('modal:open', () => {
	page.locked = true;
});

// ... и разблокируем
events.on('modal:close', () => {
	page.locked = false;
});

// Отображаем карточки после получения с сервера
events.on('catalog:loaded', (data: { items: IProduct[] }) => {
	const cardElements = data.items.map((product) => {
		const card = cloneTemplate(cardCatalogTemplate);
		const cardView = new CardView(card, events);
		return cardView.render(product);
	});

	page.gallery = cardElements;

	//catalogView.render(data);
});

// отображение модалки одной карточки
events.on('product:receivedFromServer', (data: { data: IProduct }) => {
	const preview = new PreviewView(cloneTemplate(cardPreviewTemplate), events);

	modal.render({
		content: preview.render(data.data),
	});
});

// при выборе карточки
events.on('product:select', (data: { id: string }) => {
	api
		.getProductById(data.id)
		.then((data) => {
			events.emit('product:receivedFromServer', { data });
		})
		.catch(console.error);
});

events.on('basket:change', () => {
	// Обновляем список в модалке
	const items = getBasketItems();

	basketView.render({ items });

	// Обновляем счётчик в шапке
	const count = Array.from(basketModel.items.values()).reduce(
		(sum, qty) => sum + qty,
		0
	);
	page.counter = count;
});

events.on('ul:basket-add', (event: { id: string }) => {
	basketModel.add(event.id);
});

events.on('basket:open', () => {
	const items = getBasketItems();

	modal.render({
		content: basketView.render({ items }),
	});
});

events.on('basket:basket-remove', (event: { id: string }) => {
	basketModel.remove(event.id);
});

events.on('basket:submit', () => {
	const orderView = new OrderView(cloneTemplate(orderTemplate), events);
	modal.render({
		content: orderView.render(),
	});
});

events.on('order:payment', (data) => {
	orderModel.setField(
		'payment',
		(data as { payment: 'online' | 'cash' }).payment
	);
});

events.on('order:address', (data: { address: string }) => {
	orderModel.setField('address', data.address);
});

events.on('order:email', (data: { email: string }) => {
	orderModel.setField('email', data.email);
});

events.on('order:phone', (data: { phone: string }) => {
	orderModel.setField('phone', data.phone);
});

events.on('order:next', () => {
	const contactsView = new ContactsView(
		cloneTemplate(contactsTemplate),
		events
	);
	modal.render({
		content: contactsView.render(),
	});
});

events.on('order:submit', () => {
	orderModel.setField('items', Array.from(basketModel.items.keys()));
	const order = orderModel.getOrder();

	api
		.createOrder(order)
		.then((response) => {
			// Проверяем: это ошибка или успех
			if ('error' in response) {
				alert(`Ошибка оформления заказа: ${response.error}`);
				return;
			}

			// Значит, это успешный ответ
			events.emit('order:complete', { total: response.total });
		})
		.catch((err) => {
			console.error('Сетевая ошибка:', err);
			alert('Не удалось отправить заказ. Попробуйте ещё раз.');
		});
});

events.on('order:complete', (data: { total: number }) => {
	const successView = new SuccessView(cloneTemplate(successTemplate), events);
	modal.render({
		content: successView.render(data),
	});
});

events.on('success:done', () => {
	basketModel.clear();
	orderModel.clear();
	modal.close();
});

// #endregion

function getBasketItems(): { id: string; title: string; price: number }[] {
	return Array.from(basketModel.items.entries())
		.map(([id, count]) => {
			const product = catalogModel.getProduct(id);
			if (!product || !product.price) return null;
			return Array(count).fill({
				id: product.id,
				title: product.title,
				price: product.price,
			});
		})
		.flat()
		.filter(Boolean) as { id: string; title: string; price: number }[];
}

document.querySelector('.modal.modal_active')?.classList.remove('modal_active');

api
	.getProducts()
	.then((data) => {
		catalogModel.setItems(data.items);
	})
	.catch(console.error);
