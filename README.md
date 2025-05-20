# Проектная работа "Веб-ларек"

Стек: HTML, SCSS, TS, Webpack

Структура проекта:
- src/ — исходные файлы проекта
- src/components/ — папка с JS компонентами
- src/components/base/ — папка с базовым кодом

Важные файлы:
- src/pages/index.html — HTML-файл главной страницы
- src/types/index.ts — файл с типами
- src/index.ts — точка входа приложения
- src/scss/styles.scss — корневой файл стилей
- src/utils/constants.ts — файл с константами
- src/utils/utils.ts — файл с утилитами

## Установка и запуск
Для установки и запуска проекта необходимо выполнить команды

```
npm install
npm run start
```

или

```
yarn
yarn start
```
## Сборка

```
npm run build
```

или

```
yarn build
```

 ## Данне и типы данных используемые в приложении 

 
IProduct - интерфейс, хранит типы данных карточки товара 
export interface IProduct {
    id: string;
    title: string;
    description: string;
    image: string;
    category: string;
    price: number | null;
  }

  IProductListResponse - интерфес хранит типы данных, которые выводятся на страницу. 
  export interface IProductListResponse {
    total: number;
    items: IProduct[];
  }


  IOrderRequest - интерфейс хранит типы пользовательских данных 
  export interface IOrderRequest {
    payment: 'online' | 'cash';
    email: string;
    phone: string;
    address: string;
    total: number;
    items: string[];
  }

IOrderSuccessResponse - хранит типы данных используемые в модальном успешного оформления заказа
  export interface IOrderSuccessResponse {
    id: string;
    total: number;
  }
IErrorResponse - хранит типы данных ошибки при оформлении заказа 
  export interface IErrorResponse {
    error: string;
  }

  // опредляем типы данных используемые в  модальном окне ввода данных пользователя 
  export type TUserInfo = Pick<IOrderRequest,'email'|'phone'>;
  // опредляем типы данных используемые в  модальном окне оформления заказа 
  export type TOrderInfo=Pick<IOrderRequest,'payment'|'address'>;