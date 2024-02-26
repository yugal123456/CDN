console.log('jquery-form-required.js?v=REPLACED_BY_SCRIPT');

// Checks for required fields and returns string of their labels.
// @params {HTMLElement} el selector for form element
export function checkReqs(el,toString = true){
    let requiredArray = [];
    let previousRadio = '';
    let els = Array.from(document.querySelector(el).elements);

    for(const element of els){
        try {
        if(!element.attributes.required)
            continue;

        if((element.type === 'radio' || element.type === 'checkbox') && previousRadio !== element.name && !checkRadios(element)){
            log(element.id)
            requiredArray.push(element.labels[0].textContent);
        }

        previousRadio = element.name;

        if(element.value.trim() === '')
            requiredArray.push(element.labels[0].textContent);

        if(element.attributes.type && element.type === 'email')
            if(!validateEmail(element.value) && element.value.trim() !== '')
                requiredArray.push(element.labels[0].textContent);
        } catch (e){
            log(`%cError: %cElementId: ${element.id} is mislabeled`,'color:red;font-weight:heavy;background-color:pink;','color:blue;background-color:pink;');
        }
    };
    return toString ? requiredArray.toString() : requiredArray;
}

function validateEmail(string){
    return string.includes('@') &&  string.split('@')[0].trim() !== '' && string.split('@')[1].includes('.');
}

function checkRadios(element){

    let siblings = Array.from(document.querySelectorAll(`[name="${element.name}"]`));
    log(siblings);
    let atLeastOneIsChecked = false;

    for(const sibling of siblings)
        if(sibling.checked){atLeastOneIsChecked = true; break;}
    log(atLeastOneIsChecked)
    return atLeastOneIsChecked;
}
