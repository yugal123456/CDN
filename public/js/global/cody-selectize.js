class CodySelectize extends HTMLElement {

    connectedCallback(){
        log('cody-selectize.js loaded')
        const fakeId = this.id + '-fake';
        const label = this.getAttribute('label');
      this.innerHTML = `
                        <div id="selectize-${fakeId}" class="search-opt autocomplete js-select-auto position-relative select-auto js-autocomplete" data-autocomplete-dropdown-visible-class="autocomplete--results-visible" data-truncate="on">
                            ${label === null ? '' : `<label class="form-label margin-bottom-md" for="autocomplete-input-${fakeId}">${label}</label>`}

                            <!-- select -->
                            <select id="${fakeId}" class="js-select-auto__select select__input">
                            </select>

                            <!-- input -->
                            <div class="select-auto__input-wrapper">
                                <input class="form-control js-autocomplete__input js-select-auto__input" type="text" name="${this.id}" id="autocomplete-input-${fakeId}" placeholder="type to search" autocomplete="off">

                                <div class="select-auto__input-icon-wrapper">
                          
                                <span class="select2-selection__arrow" role="presentation"><b role="presentation"></b></span>

                                <!-- close X icon -->
                                <button id="clear-state" class="reset select-auto__input-btn js-select-auto__input-btn js-tab-focus">
                                    <svg class="icon" viewBox="0 0 16 16">
                                    <title>Reset selection</title>
                                    <path d="M8,0a8,8,0,1,0,8,8A8,8,0,0,0,8,0Zm3.707,10.293a1,1,0,1,1-1.414,1.414L8,9.414,5.707,11.707a1,1,0,0,1-1.414-1.414L6.586,8,4.293,5.707A1,1,0,0,1,5.707,4.293L8,6.586l2.293-2.293a1,1,0,1,1,1.414,1.414L9.414,8Z" />
                                    </svg>
                                </button>
                                </div>
                            </div>

                            <!-- dropdown -->
                            <div class="autocomplete__results select-auto__results js-autocomplete__results" style="max-height:300px;">
                                <ul id="autocomplete4" class="autocomplete__list js-autocomplete__list">
                                <li class="select-auto__group-title padding-y-xs padding-x-sm color-contrast-medium is-hidden js-autocomplete__result" data-autocomplete-template="optgroup" role="presentation">
                                    <span class="text-truncate text-sm" data-autocomplete-label></span>
                                </li>

                                <li class="select-auto__option padding-y-xs padding-x-sm is-hidden js-autocomplete__result" data-autocomplete-template="option">
                                    <span class="is-hidden" data-autocomplete-value></span>
                                    <div class="text-truncate" data-autocomplete-label></div>
                                </li>

                                <li class="select-auto__no-results-msg padding-y-xs padding-x-sm text-truncate is-hidden js-autocomplete__result" data-autocomplete-template="no-results" role="presentation"></li>
                                </ul>
                            </div>

                            <p class="sr-only" aria-live="polite" aria-atomic="true"><span class="js-autocomplete__aria-results">0</span> results found.</p>
                            </div>

      `;

        if(this.getAttribute('href') !== null){
            setOptionsSpecial(this.id);
        }

        _(`#${this.id}`).addEventListener('change',function(){this.value = _(`#${fakeId}`).value});
    }

}

customElements.define('cody-selectize',CodySelectize);

const selectizeObject = {};

async function setOptionsSpecial(elementId, options = null){
    const optionValue = _('#'+elementId).getAttribute('optionValue');
    const optionText = _('#'+elementId).getAttribute('optionText');
    const firstOption = _('#'+elementId).getAttribute('firstOption');
    if(_('#'+elementId).getAttribute('href') !== null)
        options = _('#'+elementId).getAttribute('href');
    if(_('#'+elementId).href !== null && typeof _('#'+elementId).href !== 'undefined')
        options = _('#'+elementId).href;
    const fakeId = elementId + '-fake';
    if(typeof options === "string"){
        let res = await fetch(options,{method:'POST'})
            .then(response=>response.json())
            .catch(()=>[])
        options = res;
        selectizeObject[elementId] = options;
        let evt = new Event(elementId+"Available");
        window.dispatchEvent(evt);
    }
    _(`#${fakeId}`).innerHTML = `<option value="null">${firstOption}</option>`;
    if(optionValue === null && optionText === null){
        for(const [key,value] of Object.entries(options)){
            _(`#${fakeId}`).innerHTML += `<option value="${key}">${value}</option>`
        };

    } else {
      for(const opt of options){
            _(`#${fakeId}`).innerHTML += `<option value="${opt[optionValue]}">${opt[optionText]}</option>`;
        };
    }
    new SelectAuto(document.querySelector(`#selectize-${fakeId}`));
}
