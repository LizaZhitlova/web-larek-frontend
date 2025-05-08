import { EventEmitter } from './components/base/events';
import{WebLarekApi} from './components/WebLarekApi';
import './scss/styles.scss';
import {API_URL, CDN_URL} from "./utils/constants";
import { cloneTemplate, ensureElement, setElementData } from './utils/utils';
import {
    IProduct,
    IOrderRequest,
    IOrderSuccessResponse,
} from './types/index'


interface IBasketModel {
    items: Map<string, number>;
    add(id: string): void;
    remove(id: string): void;
  }

interface IEventEmitter {
    emit(event: string, data?: unknown): void;
    on(event: string, handler: (data?: unknown) => void): void;
  }

interface ICatalogModel {
    items: IProduct[];
    setItems(items: IProduct[]): void;
    getProduct(id: string): IProduct | undefined;
  }

  // Класс модели корзины
class BasketModel implements IBasketModel {
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
  
    protected _changed() {
      this.events.emit('basket:change', {
        items: Array.from(this.items.keys()),
      });
    }
  }
 
  // Класс модели каталога
  class CatalogModel implements ICatalogModel {
    items: IProduct[] = [];
  
    constructor(protected events: IEventEmitter) {}
  
    setItems(items: IProduct[]) {
      this.items = items;
      this.events.emit('catalog:loaded', { items });
    }
  
    getProduct(id: string): IProduct | undefined {
      return this.items.find(item => item.id === id);
    }
  }

// Интерфейсы представлений

interface IViewConstructor {
    new (container: HTMLElement, events?: IEventEmitter): IView;
  }
  
  interface IView {
    render(data?: object): HTMLElement;
  }

// Представление одного товара в корзине

class BasketItemView implements IView {
    protected title: HTMLSpanElement;
    protected addButton: HTMLButtonElement;
    protected removeButton: HTMLButtonElement;
    protected id: string | null = null;
  
    constructor(protected container: HTMLElement, protected events: IEventEmitter) {
      this.title = container.querySelector('.basket-item__title') as HTMLSpanElement;;
      this.addButton = container.querySelector('.basket-item__add') as HTMLButtonElement;
      this.removeButton = container.querySelector('.basket-item__remove') as HTMLButtonElement;
  
      this.addButton.addEventListener('click', () => {
        this.events.emit('ul:basket-add', { id: this.id });
      });
  
      this.removeButton.addEventListener('click', () => {
        this.events.emit('ul:basket-remove', { id: this.id });
      });
    }
  
    render(data: { id: string; title: string }) {
      if (data) {
        this.id = data.id;
        this.title.textContent = data.title;
      }
      return this.container;
    }
  }

// Представление всей корзины

class BasketView implements IView {
    constructor(protected container: HTMLElement) {}
  
    render(data: { items: HTMLElement[] }) {
      if (data) {
        this.container.replaceChildren(...data.items);
      }
      return this.container;
    }
  }

//представление карточки
class CardView implements IView {
    protected element: HTMLButtonElement;
    protected title: HTMLElement;
    protected category: HTMLElement;
    protected price: HTMLElement;
    protected image: HTMLImageElement;
  
    constructor(product: IProduct, protected events: IEventEmitter) {
      // клонируем шаблон
      this.element = cloneTemplate<HTMLButtonElement>('#card-catalog');
  
      // наполняем данными
      this.title = ensureElement('.card__title', this.element);
      this.category = ensureElement('.card__category', this.element);
      this.price = ensureElement('.card__price', this.element);
      this.image = ensureElement<HTMLImageElement>('.card__image', this.element);
  
      this.render(product);
  
      // событие по клику
      this.element.addEventListener('click', () => {
        this.events.emit('product:select', { id: product.id });
      });
    }
  
    render(product: IProduct): HTMLElement {
      this.title.textContent = product.title;
      this.category.textContent = product.category;
      this.price.textContent = product.price !== null ? `${product.price} синапсов` : 'Бесценно';
      this.image.src = product.image;
      this.image.alt = product.title;
  
      setElementData(this.element, { id: product.id });
      const categoryClassMap: Record<string, string> = {
        'софт-скил': 'card__category_soft',
        'хард-скил': 'card__category_hard',
        'другое': 'card__category_other',
        'дополнительное': 'card__category_additional',
        'кнопка': 'card__category_button'
      };
const normalizedCategory = product.category.toLowerCase().trim();
  const categoryModifier = categoryClassMap[normalizedCategory] || 'card__category_other';

  // Обновляем класс (удаляем старые и добавляем нужные)
  this.category.className = `card__category ${categoryModifier}`;
  
      return this.element;
    }
  }

//представление контейнера карточек
class CatalogView implements IView {
    protected container: HTMLElement;
  
    constructor(
      selector: string = '.gallery',
      protected events: EventEmitter
    ) {
      this.container = ensureElement(selector);
    }
  
    render(data?: { items: IProduct[] }): HTMLElement {
      if (!data) return this.container;
  
      const cardElements = data.items.map(product => {
        const cardView = new CardView(product, this.events);
        return cardView.render(product);
      });
  
      this.container.replaceChildren(...cardElements);
      return this.container;
    }
  }

// Инициализация

const events = new EventEmitter();
const api = new WebLarekApi(CDN_URL, API_URL);
const basketView = new BasketView(document.querySelector('.basket') as HTMLElement);
const basketModel = new BasketModel(events);
const catalogModel = new CatalogModel(events);
const catalogView = new CatalogView('.gallery', events);

function renderBasket(items: string[]) {
    const itemViews = items
      .map((id) => {
        const product = catalogModel.getProduct(id);
        if (!product) return null;
  
        // 1. Клонируем HTML-шаблон
        const item = cloneTemplate<HTMLLIElement>('#card-basket');
  
        // 2. Создаём экземпляр представления
        const itemView = new BasketItemView(item, events);
  
        // 3. Вызываем render() с нужными данными
        return itemView.render({
          id: product.id,
          title: product.title
        });
      })
      .filter(Boolean) as HTMLElement[];
  
    basketView.render({ items: itemViews });
  }

// Подписки на события

events.on('basket:change', (event: { items: string[] }) => {
    renderBasket(event.items);
  });
  
  events.on('ul:basket-add', (event: { id: string }) => {
    basketModel.add(event.id);
  });
  
  events.on('ul:basket-remove', (event: { id: string }) => {
    basketModel.remove(event.id);
  });

  events.on('catalog:loaded', (data: { items: IProduct[] }) => {
    catalogView.render(data);
});
// Загрузка данных

document.querySelector('.modal.modal_active')?.classList.remove('modal_active');

api
  .getProducts()
  .then((data) => {
    catalogModel.setItems(data.items);
  })
  .catch(console.error);