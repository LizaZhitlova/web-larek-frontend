import { EventEmitter } from './components/base/events';
import './scss/styles.scss';


// пример реализации увеличения или уменьшения количества товаров в корине через +


interface IBasketModel{
items:Map<string,number>;
add(id:string):void;
remove(id:string):void;
}


interface IEventEmmiter{
    emit:(event:string,data:unknown)=>void;
}


class BasketModel implements IBasketModel{
    items:Map<string,number>= new Map();

add (id:string):void{
if(!this.items.has(id))this.items.set(id,0);// создаём новый 
this.items.set(id,this.items.get(id)+1);// прибавляем количество 
this._changed();
}

remove(id: string): void {
    if(!this.items.has(id))return; // если нет, то и делать с ним нечего 
    if(this.items.get(id)!>0){
        this.items.set(id,this.items.get(id)!-1);
        if(this.items.get(id)===0)this.items.delete(id);//если опустили до нуля, то удаляем
    }
    this._changed();
}

protected _changed(){// метод генерирующий уведомление об изменении данных. реакция на событие будет реализовано презентером 
this.events.emit('basket:change',{items:Array.from(this.items.keys())});

}

}

// у нас есть сгенерированное событие мы занем его название, теперь к этому сгенерированному событию мы мыожем прикрепить обработчик 

const events =new EventEmmiter();
const basket = new BasketModel(events);

events.on('basket:change', (data:{items:string[]}) =>{

// выводим куда-то, возмодно задйестовать наши элемнеты отображени 
})

// так как в корзине не хранятся данные о продуктах нам нужна ещё одна модеь, которая будет хранить даннве о продуктах 

//  итрефес самого товара 

interface IProduct{
    id:string;
    title:string;
}
// интерфес для хранения спика этих товаров 
interface CatalogModel{
    items:IProduct[];
    setItems(items:IProduct[]):void;// чтобы установить после загрузки страницы из АПИ 
    getProduct(id:string):IProduct;// чтобы получить сприсок при необходимости 
}

// так же необходимо реализовать техническую модель даннанных - состояние страницы, которая не связвна напрямую с пользовотельскими событиями.Но нам необходимо знать что отображается на странице, какое модальное окно открыто и т.д
// к этим состояниям мы добавляем опр. методы, как например setItems(items:IProduct[]):void - установка при загрузки страницы 




// после того как написаны можели данных необходимо переходить к реализации отображения- мы получаем в работу опр. HTML элемен и передаём в него данные.
// может иметь следюущий интерфейс 

//интерфейс для конструктора 
interface IViewConstructor{
    new (container:HTMLElement,events?:IEventEmmiter):IView;
}
// интерфейс для класса отображения 
interface IView{
    render(data?:object):HTMLElement;// получает данные и возвращает HTML элемент с заполненными данными 
}

// в случае использования IView мы можем реализовать отображение отдельного товара в корзине следующим образом:

class BasketItemView implements IView{
    // элементы внутри контейнера
    protected title:HTMLSpanElement;
    protected addButton:HTMLButtonElement;
    protected removeButton:HTMLButtonElement;
    // элементы которые хотим сохранить на будущее \
    protected id:string|null=null;

    constructor(protected container:HTMLElement,protected events:IEventEmmiter){
        // инициализируем, чтобы не искать повторно 
        this.title=container.querySelector('.basket-item__title')as HTMLSpanElement;
        this.addButton=container.querySelector('.basket-item__add') as HTMLButtonElement;
        this.removeButton=container.querySelector('.basket-item__remove') as HTMLButtonElement;

        //устанавливаем событие 

        this.addButton.addEventListener("click",()=>{
//генерируем событие в брокере 
            this.events.emit('ul:basket-remove',{id:this.id})
        });
}

render(data:{id:string,title:string}) {
    if(data){
// если есть новые данные, то запоминаем их 
        this.id=data.id;
        // и выведем в интерфейс 
        this.title.textContent=data.title;
    }
    return this.container;
}
}

// вся корзина целиком можем выглядеть так 

class BasketView implements IView{

    constructor(protected container:HTMLElement){}

    render(data:{items:HTMLElement[]}) {
        if(data){

            this.container.replaceChildren(...data.items);
        }
return this.container;
    }

}


// поле реализации отображени и моделей код необходимо объединить
// для объедининения нам необходимо инициировать брокер событий и создать экземпляры соотвествующих классов 
// инициализация 

const api= ShopAPI();
const events= new EventEmitter();
const basketView=new BasketView(document.querySelector(".basket"));
const basketModel = new BasketModel(events);
const catalogModel =new CatalogModel(events);
// можно собрать в функции или классы отдельные экраны с логикой их формирования

function renderBasket(items:string[]){
    basketView.render{
items.map(id=>{

    const itemView=new BasketItemView(events);
    return itemView.render(catalogModel.getProduct(id))
})

    }

}
// при изменении рендерим
events.on("basket:change",(event:{items:string[]})=>{
renderBasket(event.items);
});

// при дествиях ихменяем модель, а далее рендерим 
events.on("ul:basket-add",(event:{id:string})=>{
    basketModel.add(event.id);
    });

    events.on("ul:basket-remove",(event:{id:string})=>{
        basketModel.remove(event.id);
        });
// подгружаем начальные данные и запускаем процессы
        api.getCatalog()
        .then(catalogModel.setItems.bind(catalogModel))
        .catch(err=>console.error(err));