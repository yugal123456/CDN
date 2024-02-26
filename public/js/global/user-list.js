class UserList extends HTMLElement {
    connectedCallback(){
        log('user-list.js loaded');
        this.innerHTML = `
            <div id="user-list" class="autocomplete js-select-auto position-relative select-auto js-autocomplete" data-autocomplete-dropdown-visible-class="autocomplete--results-visible" data-truncate="on">
            <label class="form-label margin-bottom-md" for="autocomplete-input-id">Start typing to search users</label>

            <!-- select -->
            <select id="user-id" class="js-select-auto__select">
                <option>Select Customer</option>
                <?php print("<option>test</option>")?>
            </select>

            <!-- input -->
            <div class="select-auto__input-wrapper">
                <input class="form-control js-autocomplete__input js-select-auto__input" type="text" name="autocomplete-input-id" id="autocomplete-input-id" placeholder="customer name" autocomplete="on">

                <div class="select-auto__input-icon-wrapper">
        
        

                <!-- close X icon -->
                <button class="reset select-auto__input-btn js-select-auto__input-btn js-tab-focus">
                    <svg class="icon" viewBox="0 0 16 16">
                    <title>Reset selection</title>
                    <path d="M8,0a8,8,0,1,0,8,8A8,8,0,0,0,8,0Zm3.707,10.293a1,1,0,1,1-1.414,1.414L8,9.414,5.707,11.707a1,1,0,0,1-1.414-1.414L6.586,8,4.293,5.707A1,1,0,0,1,5.707,4.293L8,6.586l2.293-2.293a1,1,0,1,1,1.414,1.414L9.414,8Z" />
                    </svg>
                </button>
                </div>
            </div>

            <!-- dropdown -->
            <div id="hideme" class="autocomplete__results select-auto__results js-autocomplete__results" style="max-height:300px;">
                <ul id="autocomplete1" class="autocomplete__list js-autocomplete__list">
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
        setUserList();
    }
}

customElements.define('user-list', UserList);

async function setUserList(){
    let options = await fetch('/user/getUsersList').then(res=>res.json());
    let str = ''
    options.forEach(opt=>{
         str += `<option value="${opt.id}">${opt.full_name}</option>`;
    });
    _('#user-id').innerHTML += str;
    new SelectAuto(_('#user-list'));
}
