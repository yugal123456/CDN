console.log('lib.js loaded');
/** Shorthand for console.log()*/
const log = console.log;
const ctable = console.table;
/** delay for number of ms please refrain from using */
const delay = ms => new Promise(res => setTimeout(res, ms));
/** Shorthand for document.querySelector()*/
const _ = function(selector){return document.querySelector(selector)};
/** Shorthand for document.querySelectorAll() as an array*/
const _$ = function(selector){return Array.from(document.querySelectorAll(selector))};

/** work-alike for basename() in php */
function basename(path){
    return path.split('/').pop();
}

/** shortcut for posting in fetch */
const post = async (path,data={})=>{
    try{
        return await fetch(path,{
            method:"POST",
            body:JSON.stringify(data),
            headers:{
                "Content-Type":"application/json",
            }
        })
            .then(res=>res.json());
    } catch (e) {
        return false;
    }
};

/** does same thing as php isset, this version only works with object properties though*/
const isset = function(variable){return (typeof variable !== 'undefined' && variable !== null)};

/** Allows custom notifications */
const notify=(text,title='',reload = false)=>{
    _('#notify-notification').innerHTML = text;
    _('#notification-title').innerText = title;
    showModal('notify');
    if(reload){
        _('#modal-notify').addEventListener('modalIsClose',()=>{location.reload()})
    }
}

const UPDATE_SUCCESS = 'Update Successful';
const UPDATE_FAILED = 'Update Failed';

function showModal(modalId){
    let event = new Event('openModal');
    event.detail = _(`#modal-${modalId}`);
    _(`#modal-${modalId}`).dispatchEvent(event);
}

function closeModal(modalId) {
    let event = new Event('closeModal');
    event.detail = _(`#modal-${modalId}`);
    _(`#modal-${modalId}`).dispatchEvent(event);
}

/** Easy way to get php session from cookie */
function getSessionId() {
    return /SESS\w*ID=([^;]+)/i.test(document.cookie) ? RegExp.$1 : false;
}

/** Allows custom confirmation */
async function returnConfirm(){
    let promise = new Promise((resolve, reject)=>{
        _('#confirmcancel').addEventListener('click',function(){
            resolve(false);
        });
        _('#confirmapprove').addEventListener('click',function(){
            resolve(true);
        });
    });
    const result = await promise;
    return result;
};

function setListeners(object,type = 'onclick'){
    for(const [element,event] of Object.entries(object))
        _(element)[type] = event;
}

function confirmation(text,title=''){
    _('#confirmation').innerHTML = text;
    _('#confirmation-title').innerText = title;
    let event = new Event('openModal');
    event.detail = _('#modal-confirm');
    _('#modal-confirm').dispatchEvent(event);
    return returnConfirm().then((res)=>{return res;})
}

function standardNumberFormat(num, cur = false) {
    if (cur) return new Intl.NumberFormat("en-US", { style: 'currency', currency: 'USD' }).format(num);
    return new Intl.NumberFormat("en-US", { maximumFractionDigits: 2, minimumFractionDigits: 2 }).format(num)
}

/**
 * This calls the loading modal to show user something is happening.
 * to activate use 'wait.on()'
 * to deactivate use 'wait.off()'
*/
const wait={
    on:function(message = 'Please Wait While We Search Our Database'){
        _('[data-modalmessage="wait"]').innerText = message;
        showModal('wait');
        window.addEventListener("click", this.haltWindowFunctions, true);
        return;
    },

    off:function(){
        window.removeEventListener('click', this.haltWindowFunctions, true);
        closeModal('wait');
    },

    haltWindowFunctions:function(e) {
        e.stopImmediatePropagation();
        e.stopPropagation();
        e.preventDefault();
    }
}

/**
 * Allows variables to be watched for a change
 * @param {function} func(key, value, target) the function to be performed upon variable change
 * @param {Object} obj to use as target if starting values are needed
*/

class Watch {
    constructor(func, obj={}){
        this.targetObj = obj;
        this.proxyObj = new Proxy(this.targetObj, {
        set: function (target, key, value) {
            target[key] = value;
            func(key,value,target);
        return true;
        }
        });
        return this.proxyObj;
  }
}

