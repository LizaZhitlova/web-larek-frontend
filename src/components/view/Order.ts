import {
	ensureAllElements,
	ensureElement, 
} from '../../utils/utils';
import {IEventEmitter} from "../base/events";

export class OrderView {
	private addressInput: HTMLInputElement;
	private buttons: HTMLButtonElement[];
	private submitButton: HTMLButtonElement;

	private payment: string | null = null;
	private address = '';

	constructor(private container: HTMLElement, private events: IEventEmitter) {
		this.addressInput = ensureElement<HTMLInputElement>(
			'.form__input',
			this.container
		);
		this.buttons = ensureAllElements<HTMLButtonElement>(
			'.button_alt',
			this.container
		);
		this.submitButton = ensureElement<HTMLButtonElement>(
			'.order__button',
			this.container
		);

		// Обработчик выбора способа оплаты
		this.buttons.forEach((btn) => {
			btn.addEventListener('click', () => {
				const payment = btn.name === 'card' ? 'online' : 'cash';
				this.payment = payment;
				this.events.emit('order:payment', { payment });
				this.updateButtonsState(btn);
				this.checkValidity();
			});
		});

		// Обработчик ввода адреса
		this.addressInput.addEventListener('input', () => {
			this.address = this.addressInput.value.trim();
			this.events.emit('order:address', { address: this.address });
			this.checkValidity();
		});

		// Обработчик кнопки «Далее»
		this.submitButton.addEventListener('click', (event) => {
			event.preventDefault();
			this.events.emit('order:next');
		});

		this.submitButton.disabled = true; // по умолчанию отключена
	}

	// Подсвечивает выбранную кнопку оплаты
	private updateButtonsState(activeBtn: HTMLButtonElement) {
		this.buttons.forEach((btn) => {
			btn.classList.toggle('button_alt-active', btn === activeBtn);
		});
	}

	// Валидация — адрес не пустой и способ оплаты выбран
	private checkValidity() {
		const isValid = this.payment !== null && this.address.length > 0;
		this.submitButton.disabled = !isValid;
	}

	render(): HTMLElement {
		return this.container;
	}
}

export class ContactsView {
	private emailInput: HTMLInputElement;
	private phoneInput: HTMLInputElement;
	private submitButton: HTMLButtonElement;
	private emailError: HTMLElement;
	private phoneError: HTMLElement;
	private email = '';
	private phone = '';

	constructor(private container: HTMLElement, private events: IEventEmitter) {
		this.emailInput = ensureElement<HTMLInputElement>(
			'.form__input[name="email"]',
			this.container
		);
		this.phoneInput = ensureElement<HTMLInputElement>(
			'.form__input[name="phone"]',
			this.container
		);
		this.submitButton = ensureElement<HTMLButtonElement>(
			'button[type="submit"]',
			this.container
		);
		
		// Создаем элементы для отображения ошибок
		this.emailError = this.createErrorElement(this.emailInput, 'Введите корректный email');
		this.phoneError = this.createErrorElement(this.phoneInput, 'Введите корректный номер телефона');

		this.emailInput.addEventListener('input', () => {
			this.email = this.emailInput.value.trim();
			this.validateEmail();
			this.events.emit('order:email', { email: this.email });
			this.checkValidity();
		});

		this.phoneInput.addEventListener('input', () => {
			this.phone = this.phoneInput.value.trim();
			this.validatePhone();
			this.events.emit('order:phone', { phone: this.phone });
			this.checkValidity();
		});

		this.submitButton.addEventListener('click', (e) => {
			e.preventDefault();
			if (this.validateEmail() && this.validatePhone()) {
				this.events.emit('order:submit');
			}
		});

		this.submitButton.disabled = true;
	}

	private createErrorElement(input: HTMLInputElement, defaultMessage: string): HTMLElement {
		let errorElement = input.nextElementSibling as HTMLElement;
		if (!errorElement || !errorElement.classList.contains('error-message')) {
			errorElement = document.createElement('div');
			errorElement.className = 'error-message';
			errorElement.style.color = 'red';
			errorElement.style.fontSize = '12px';
			errorElement.style.marginTop = '5px';
			input.parentNode?.insertBefore(errorElement, input.nextSibling);
		}
		errorElement.textContent = defaultMessage;
		errorElement.style.display = 'none';
		return errorElement;
	}

	private validateEmail(): boolean {
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		const isValid = emailRegex.test(this.email);
		
		if (this.email.length === 0) {
			this.emailError.textContent = 'Email не может быть пустым';
			this.emailError.style.display = 'block';
			return false;
		} else if (!isValid) {
			this.emailError.textContent = 'Введите корректный email (например: user@example.com)';
			this.emailError.style.display = 'block';
			return false;
		} else {
			this.emailError.style.display = 'none';
			return true;
		}
	}

	private validatePhone(): boolean {
		// Простая валидация для российских номеров: +7XXXXXXXXXX или 8XXXXXXXXXX
		const phoneRegex = /^(\+7|8)[0-9]{10}$/;
		const cleanPhone = this.phone.replace(/[^\d+]/g, '');
		const isValid = phoneRegex.test(cleanPhone);
		
		if (this.phone.length === 0) {
			this.phoneError.textContent = 'Телефон не может быть пустым';
			this.phoneError.style.display = 'block';
			return false;
		} else if (!isValid) {
			this.phoneError.textContent = 'Введите корректный номер телефона (например: +79991234567 или 89991234567)';
			this.phoneError.style.display = 'block';
			return false;
		} else {
			this.phoneError.style.display = 'none';
			return true;
		}
	}

	private checkValidity() {
		const isValid = this.validateEmail() && this.validatePhone();
		this.submitButton.disabled = !isValid;
	}

	render(): HTMLElement {
		return this.container;
	}
}

export class SuccessView {
	private title: HTMLElement;
	private description: HTMLElement;
	private closeButton: HTMLButtonElement;

	constructor(private container: HTMLElement, private events: IEventEmitter) {
		this.title = ensureElement('.order-success__title', this.container);
		this.description = ensureElement(
			'.order-success__description',
			this.container
		);
		this.closeButton = ensureElement<HTMLButtonElement>(
			'.order-success__close',
			this.container
		);

		this.closeButton.addEventListener('click', () => {
			this.events.emit('success:done');
		});
	}

	render(data: { total: number }) {
		this.title.textContent = 'Заказ оформлен';
		this.description.textContent = `Списано ${data.total} синапсов`;
		return this.container;
	}
}