import {getUrlParams, urlParams} from '/public/js/global/modules/getUrlParams.js'

setOptionsSpecial("question");

_('#question').onchange = gotoSearch;

let activeQuestion = 0;
let selectizeObject = {};

function setActiveQuestion(){
    activeQuestion = +this.value;
    display();
}

function gotoSearch(){
    activeQuestion = _('#question').value;
    display();
}

function goto(){
    for(const k of selectizeObject.question)
        
        if(k.id == activeQuestion)
            try{
                k.answer = atob(k.answer)
                return k;
            } catch (e){
                return k;
            }
}

function display(){
    const post = goto();
    if (post !== undefined && post !== null && post !== '') {
        _('#title').innerHTML = post.question + '<i style="margin-left:10px; cursor: pointer;" id="house" class="house primary" data-tippy-content="Back to Docs Homepage"></i>';
        _('#answer').innerHTML = post.answer;
        _('#grid').style.display = 'none';
        _('#answer-card').style.display = 'block';
        _('#house').onclick = home
        makeTippy();
    }
}

function home(){
    _('#title').innerText = '';
    _('#answer').innerHTML = '';
    _('#grid').style.display = 'block';
    _('#answer-card').style.display = 'none';
}

window.addEventListener('questionAvailable', makeMenu)
window.addEventListener('questionAvailable', checkParams)

function checkParams(){
    if(!urlParams) return;
    activeQuestion = urlParams.search;
    display();
}

function makeMenu(){
    for(const q of selectizeObject.question)
        if (q.category !== undefined && q.category !== null && q.category !== '') {
            _('#' + q.category).innerHTML += `<li class="question margin-bottom-sm color-primary" value='${q.id}'>${q.question}</li>`;
        }
    const listItems = _$('.question');
    for(const q of listItems)
        q.onclick = setActiveQuestion;
}

async function setOptionsSpecial(elementId, options = null){
    const optionValue = _('#'+elementId).getAttribute('optionValue');
    const optionText = _('#'+elementId).getAttribute('optionText');
    const firstOption = _('#'+elementId).getAttribute('firstOption');
    let currentURL = new URL(window.location.href);
    options = currentURL.protocol + "//" + currentURL.host + "/docs/getkb";
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
}


let navItem;
navItem = $('a[href="/docs/index/"]');
navItem.closest('li.sidenav__item .sidenav__link').addClass('active');