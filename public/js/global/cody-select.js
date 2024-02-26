class CodySelect extends HTMLElement {

    connectedCallback(){
        log('cody-select.js loaded')
        const fakeId = this.id + '-fake';
        const label = this.getAttribute('label');
        if(this.getAttribute('href') !== null){
            setOptions(this.id);
        }
        this.innerHTML = `
            <div id="select-${fakeId}">
                ${label === null ? '' : `<label for="${fakeId}">${label}</label>`}
                <div style="min-width:200px" class="select width-100%">
                    <select name="${fakeId}" id="${fakeId}" class="select__input form-control">
                        <option value="null">Select Option</option>
                    </select>

                  
                    
                </div>
            </div>
        `;

        _(`#${this.id}`).addEventListener('change',function(){this.value = _(`#${fakeId}`).value});
    }

}

customElements.define('cody-select',CodySelect);

async function setOptions(elementId, options = null){
    const optionValue = _('#'+elementId).getAttribute('optionValue');
    const optionText = _('#'+elementId).getAttribute('optionText');
    if(_('#'+elementId).getAttribute('href') !== null)
        options = _('#'+elementId).getAttribute('href');
    if(_('#'+elementId).href !== null && typeof _('#'+elementId).href !== 'undefined')
        options = _('#'+elementId).href;
    const fakeId = elementId + '-fake';
    if(typeof options === "string"){
        let res = await fetch(options,{method:'POST'})
            .then(response=>response.json())
        options = res;
    }
    _(`#${fakeId}`).innerHTML = '<option value="null">Select Option</option>';
    if(optionValue === null && optionText === null){
        for(const [key,value] of Object.entries(options)){
            _(`#${fakeId}`).innerHTML += `<option value="${key}">${value}</option>`
        };

    } else {
        options.forEach(opt=>{
            _(`#${fakeId}`).innerHTML += `<option value="${opt[optionValue]}">${opt[optionText]}</option>`
        });
    }
}
