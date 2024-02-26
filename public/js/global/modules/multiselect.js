// data = {
//      url: '/did/order',
//      optionText: 'key-for-text',
//      optionValue: 'value-for-option', //(optional, if not set, key will be used for both)
//      label: (optional),
//      id: (optional),
// }

export default class MultiSelect{

    #data;
    #baseElementSelector;
    #optionArray = [];
    #id;
    #label;

    constructor(data = {}, baseElementSelector = 'multi-select'){
        this.#data = data;
        this.#baseElementSelector = baseElementSelector;
        this.#setOptions(data);
        this.#id = this.#data.id ?? 'advm-select'
    }

    async #setOptions(){
        this.#optionArray = await fetch(this.#data.url,{ method:'GET',
                                 headers:{'Content-Type':'application/json'},
                               })
                          .then(res=>res.json())
                          .catch(res=>false);
        this.#buildGui();
    }

    #buildGui(){
        let html = this.#htmlGenerator.css;
        html += this.#htmlGenerator.openSelect(this.#id);
        if(this.#data.optionValue){
            for(const item of this.#optionArray){
                html += this.#htmlGenerator.option(item[this.#data.optionText],item[this.#data.optionValue])
            };
        }else{
            for(const item of this.#optionArray){
                html += this.#htmlGenerator.option(item[this.#data.optionText],item[this.#data.optionText])
            };
        }
        html += this.#htmlGenerator.closeSelect(this.#id);
        document.querySelector(this.#baseElementSelector).innerHTML = html;
        document.querySelector(this.#baseElementSelector).innerHTML += this.#htmlGenerator.js;

        document.querySelector(`[aria-controls="${this.#id}"]`).onclick = ()=> document.querySelector('#'+this.#id).childNodes.forEach(node=>node.selected = false);
    }

    getSelected(){
        log('test')
        const selectedVals = [...document.querySelector('#'+this.#id).selectedOptions].map(o => o.value);
        return selectedVals;
    }

    #htmlGenerator = {
        css: `
            <link rel="stylesheet" href="/public/css/codyhouse/multi-select.css"></link>
        `,
        js:`
            <script src="/public/js/codyhouse/multi-select.js?v=REPLACED_BY_SCRIPT" defer></script>
        `,
        openSelect:(id)=>`
            <div class="advm-select js-advm-select">
            <select class="width-100% height-100%" name[]="${id}" id="${id}" multiple>
        `,
        closeSelect:(id)=>`
            </select>

            <div class="advm-select__list cd-hide js-advm-select__list" role="listbox">
                <div role="group" describedby="optgroup-label">
                <!-- label -->
                <div class="advm-select__label js-advm-select__label" id="optgroup-label">{optgroup-label}</div>

                <!-- option -->
                <div class="advm-select__option js-advm-select__option" role="option">
                    <svg class="advm-select__check cd-icon" style="--size: 16px" viewBox="0 0 16 16" aria-hidden="true">
                    <polyline stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round" points="1,9 5,13 15,3" />
                    </svg>

                    <span class="cd-margin-right-sm">{option-label}</span>
                </div>
                </div>
            </div>
            </div>

            <div class="cd-margin-top-3xs">
            <button class="btn btn--primary js-advm-select-reset-btn" aria-controls="${id}">Reset</button>
            </div>
        `,
        option:(optionText,optionValue)=>`<option value="${optionValue}">${optionText}</option>`
    }

}
