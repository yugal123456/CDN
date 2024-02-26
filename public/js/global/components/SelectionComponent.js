class SelectionComponent extends HTMLElement {
    constructor() {
        super();

        this.searchValues = [];

        this.uuid = this.uuidv4();
        this.initialValue = this.getAttribute('initialValue');
        this.classes = this.getAttribute('class');
        this.name = this.getAttribute('name');
        this.placeholder = this.getAttribute('placeholder');
        this.minimumCharactersForSearch = this.getAttribute('minimumSearchCharacters');

        if (this.placeholder === '' || this.placeholder === null) {
            this.placeholder = 'Start typing to filter search';
        }

        if (this.minimumCharactersForSearch === '' || this.minimumCharactersForSearch === null) {
            this.minimumCharactersForSearch = 3;
        }
    }

    init(title, list, required = true) {
        list.unshift({ label: "None", value: "0" });
        this.searchValues = list;

        let requiredHtml = (required === true) ? '<span class="color-error">*</span>' : '';

        let titleHtml = (title === '') ? '' : '<label class="am2-form-label am2-margin-bottom-2xs" for="autocomplete-input">${title}${requiredHtml}</label>';

        this.innerHTML =
            `
            <link rel="stylesheet" href="/public/css/codyhouse/_1_circle-loader.css">
            <link rel="stylesheet" href="/public/css/codyhouse/_2_autocomplete.css">

            <div class="${this.classes}">
                <div id="autocomplete-${this.uuid}" class="autocomplete am2-position-relative js-autocomplete am2-width-100%" data-autocomplete-dropdown-visible-class="autocomplete--results-visible">
                    ${titleHtml}
                        <div class="am2-position-relative">
                            <input id="autocomplete-input-${this.uuid}" name="${this.name}" class="am2-form-control am2-width-100% js-autocomplete__input select__input form-control" type="text" placeholder="${this.placeholder}" autocomplete="off">
                            <input id="hidden-input-${this.uuid}" name="${this.name}" type="text" style="display:none">
        
                            <div class="autocomplete__loader am2-position-absolute am2-top-0 am2-right-0 am2-padding-right-sm am2-height-100% am2-flex am2-items-center" aria-hidden="true">
                                <div class="circle-loader circle-loader--v1">
                                    <div class="circle-loader__circle"></div>
                                </div>
                            </div>
                        </div>
                        <div class="autocomplete__results js-autocomplete__results">
                            <ul class="autocomplete__list js-autocomplete__list">
                                <li class="autocomplete__item am2-padding-y-xs am2-padding-x-sm am2-text-truncate js-autocomplete__item autocomplete__item--is-hidden"></li>
                            </ul>
                        </div>
                        <p class="am2-sr-only" aria-live="polite" aria-atomic="true"><span class="js-autocomplete__aria-results">0</span> results found.</p>
                    </div>
                </div>
            </div>
        `;

        this.initializeAutocomplete();
    }

    initializeAutocomplete() {
        if (typeof Autocomplete === 'undefined') {
            const script = document.createElement('script');
            script.src = '/public/js/codyhouse/_2_autocomplete.js';
            script.onload = () => this.setupAutocomplete();
            document.head.appendChild(script);
        } else {
            this.setupAutocomplete();
        }
    }

    setupAutocomplete() {
        var autocomplete = document.querySelector(`#autocomplete-${this.uuid}`);

        this.autocompleteInstance = new Autocomplete({
            element: autocomplete,
            searchData: (query, callback) => {
                const data = this.searchValues.filter(item => item.label.toLowerCase().includes(query.toLowerCase()));
                callback(data);
            },
            onClick: (option, obj, event, callback) => {
                const selectedItem = this.searchValues.find(item => item.label === option.textContent);
                this.value = selectedItem.value;
                obj.input.value = selectedItem.label;
                $(this).trigger('change');
                callback();

                obj.input.blur();
            },
            characters: this.minimumCharactersForSearch,
        });

        this.value = this.initialValue;

        const inputElement = document.querySelector(`#autocomplete-input-${this.uuid}`);
        if (inputElement) {
            inputElement.addEventListener('focus', (event) => {

                event.target.dataset.initialValue = event.target.value;
                event.target.value = '';
            });

            inputElement.addEventListener('blur', (event) => {
                let value = event.target.value.trim();

                event.target.value = event.target.dataset.initialValue || value;
            });
        }
    }

    get value() {
        return this._value;
    }

    set value(newValue) {
        this._value = newValue;

        const inputElement = document.querySelector(`#autocomplete-input-${this.uuid}`);
        const hiddenInputElement = document.querySelector(`#hidden-input-${this.uuid}`);

        if (inputElement) {
            const selectedItem = this.searchValues.find(item => item.value === newValue);
            inputElement.value = selectedItem ? selectedItem.label : '';

            if (hiddenInputElement) {
                hiddenInputElement.value = selectedItem ? selectedItem.value : '';
            }
        }
    }

    uuidv4() {
        return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, c => (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16));
    }
}

customElements.define('selection-component', SelectionComponent);
