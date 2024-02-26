log('getUrlParams.js loaded');
export const urlParams = {};

export function getUrlParams(){

    const url = document.location.href;

    if(!url.includes('?')) return;

    let searchValue = url.split('?');
    searchValue.shift();

    for(const el of searchValue){
        const strings = el.split("=")
        urlParams[decodeURIComponent(strings[0])] = decodeURIComponent(strings[1]);
    }

    log('URLparams: ',urlParams);
    return urlParams;
};


(()=>getUrlParams())();
