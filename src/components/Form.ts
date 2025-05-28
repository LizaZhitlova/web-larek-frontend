import {ensureElement } from '../utils/utils';
import {IEventEmitter} from '../components/base/events'

export abstract class Form {
	protected submitButton: HTMLButtonElement;

	constructor(
		protected container: HTMLElement,
		protected events: IEventEmitter,
		submitSelector: string = 'button[type="submit"]'
	) {
		this.submitButton = ensureElement<HTMLButtonElement>(
			submitSelector,
			container
		);
		this.submitButton.disabled = true;

		this.submitButton.addEventListener('click', (e) => {
			e.preventDefault();
			this.onSubmit();
		});
	}

	// Метод вызывается при клике по кнопке отправки
	protected abstract onSubmit(): void;

	// Метод для включения/отключения кнопки
	protected setSubmitEnabled(enabled: boolean) {
		this.submitButton.disabled = !enabled;
	}

	render(): HTMLElement {
		return this.container;
	}
}
