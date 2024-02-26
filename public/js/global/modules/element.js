export default class Element{
    constructor(element){
        this.element = document.createElement(element);
    }

    set(options = {}){
		for(const [k,v] of Object.entries(options))
			this.element[k] = v;

        return this;
    }

    inject(appendTo){
        document.querySelector(appendTo).appendChild(this.element);

        return this;
    }
}

