// displays current page in nav and highlights it
(()=>{
    let loc = window.location.href.split('/');
    if(loc.length < 5) return;
    let finder = `/${loc[3]}/${loc[4]}`;
    log(finder)
    let navItem;
    navItem = _(`[href="${finder}/"]`);

    if(navItem === null)
        navItem = _(`[href="${finder}"]`);
    if(navItem === null)
        navItem = _(`[href="/${loc[3]}"]`);
    if(navItem === null)
        return;

    if(navItem.classList.contains('dir-link')) return;

    navItem.classList.add('active-link');
    navItem.parentElement.parentElement.parentElement.classList.add('sidenav__item--expanded');
})()


// const theBeastOfSideNavigation = _('.app-ui__nav.js-app-ui__nav');
// const theShire = _('#theShire');

// _('#castSideNavigationIntoTheAbyss').onclick=()=>{
// 	theBeastOfSideNavigation.classList.add('is-hidden');
// 	theShire.classList.replace('app-ui__body','app-ui__body-no-beast');
// 	_('#pullSideNavigationOutOfTheAbyss').classList.remove('is-hidden');
// }

// _('#pullSideNavigationOutOfTheAbyss').onclick=()=>{
// 	theBeastOfSideNavigation.classList.remove('is-hidden');
// 	theShire.classList.replace('app-ui__body-no-beast','app-ui__body');
// 	_('#pullSideNavigationOutOfTheAbyss').classList.add('is-hidden');
// }

const theBeastOfSideNavigation = _('.app-ui__nav.js-app-ui__nav');
const theShire = _('#theShire');
const closeMenu = _('.sidenav__item.sidenav__item--expanded');
const castSideDiv = document.getElementById("castSideNavigationIntoTheAbyss");
const myButton = document.getElementById('castSideNavigationIntoTheAbyss');
const copiedTippy = tippy(myButton, {
  content: '',
});
const elementsWithClass = document.querySelectorAll('.sidenav__link');

// Iterate  each element and create a Tippy instance
elementsWithClass.forEach(element => {
    const tippyInstance = tippy(element, {
        content: () => {
                return `<div class="custom-tooltip">${element.textContent}</div>`;
            },
        allowHTML: true,
        arrow:true,
        placement:'top-start'
    });
  });
  
_('#castSideNavigationIntoTheAbyss').onclick=()=>{
    // theBeastOfSideNavigation.classList.add('is-hidden');
    // theShire.classList.replace('app-ui__body','app-ui__body-no-beast');
    // _('#pullSideNavigationOutOfTheAbyss').classList.remove('is-hidden');


    if (theBeastOfSideNavigation.classList.contains('is-hidden')) {
        localStorage.removeItem("menu");
        castSideDiv.removeAttribute("data-tippy-content");
        copiedTippy.setContent("Hide Side Navigation");
        castSideDiv.innerHTML = `<svg width="9" height="14" viewBox="0 0 9 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                            <path d="M7.16797 1.51693L1.68498 6.99992L7.16797 12.4829" stroke="#05BFFF" stroke-width="2.66098" stroke-linecap="round" stroke-linejoin="round"/>
                                                        </svg>`;

        // If it's present, remove it
        theBeastOfSideNavigation.classList.remove('is-hidden');
        theShire.classList.replace('app-ui__body-no-beast','app-ui__body');
        // closeMenu.classList.replace('sidebar-set-open','sidenav__item--expanded');
    } else {
        castSideDiv.removeAttribute("data-tippy-content");
        copiedTippy.setContent("Expand Side Navigation");
        castSideDiv.innerHTML = `<svg width="9" height="15" viewBox="0 0 9 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                            <path d="M1.94043 12.9496L7.42342 7.46663L1.94043 1.98364" stroke="#068AF0" stroke-width="2.66098" stroke-linecap="round" stroke-linejoin="round"/>
                                                        </svg>`;

        // localStorage.getItem("menu")
        localStorage.setItem("menu", "collapse");
        // If it's not present, add it
        theBeastOfSideNavigation.classList.add('is-hidden');
        theShire.classList.replace('app-ui__body','app-ui__body-no-beast');
        // closeMenu.classList.replace('sidenav__item--expanded','sidebar-set-open');
    }
}
window.onload = function(e){ 
    var getValue = localStorage.getItem("menu");
    console.log(getValue);
    copiedTippy.setContent("Hide Side Navigation");
    if (getValue == "collapse" ){
        castSideDiv.removeAttribute("data-tippy-content");
        copiedTippy.setContent("Expand Side Navigation");
        castSideDiv.innerHTML = `<svg width="9" height="15" viewBox="0 0 9 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                            <path d="M1.94043 12.9496L7.42342 7.46663L1.94043 1.98364" stroke="#068AF0" stroke-width="2.66098" stroke-linecap="round" stroke-linejoin="round"/>
                                                        </svg>`;
        theBeastOfSideNavigation.classList.add('is-hidden');
        theShire.classList.replace('app-ui__body','app-ui__body-no-beast');
        // closeMenu.classList.replace('sidenav__item--expanded','sidebar-set-open');
    }
}
