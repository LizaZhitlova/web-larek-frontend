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
