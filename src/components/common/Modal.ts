import { ensureElement } from '../../utils/utils';
import { IEvents } from '../base/events';

interface IModalData {
	content: HTMLElement;
}

export class Modal {
	protected _closeButton: HTMLButtonElement;
	protected _content: HTMLElement;

	constructor(protected container: HTMLElement, protected events: IEvents) {
		this._closeButton = ensureElement<HTMLButtonElement>(
			'.modal__close',
			container
		);
		this._content = ensureElement<HTMLElement>('.modal__content', container);

		this._closeButton.addEventListener('click', this.close.bind(this));
		this.container.addEventListener('click', this.close.bind(this));
		this._content.addEventListener('click', (event) => event.stopPropagation());
	}

	set content(value: HTMLElement) {
		this._content.replaceChildren(value);
	}

	open() {
		this.container.classList.add('modal_active');
		this.events.emit('modal:open');
	}

	close() {
		this.container.classList.remove('modal_active');
		this.content = null;
		this.events.emit('modal:close');
	}

	render(data: IModalData): HTMLElement {
		if (data && data.content) {
			this.content = data.content;
		}
		this.open();
		return this.container;
	}
}
