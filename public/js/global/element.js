class Element{
    constructor(element){
        this.element = document.createElement(element);
    }

    set(text, value){
        this.element.text = text;
        this.element.value = value;

        return this;
    }

    inject(appendTo){
        document.querySelector(appendTo).appendChild(this.element);

        return this;
    }
}