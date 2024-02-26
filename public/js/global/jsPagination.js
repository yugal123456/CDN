/**
* Class to help with js pagination. Options are enabled as attributes
* for example if a search box is wanted, add 'search' into the
* <js-pagination> tag like so <js-pagination search>
* possible options are:
* search, download
*/

import {default as downloadCsv} from './downloadcsv.js?v=REPLACED_BY_SCRIPT'
import {generateWorkers} from './arrayFilter.js?v=REPLACED_BY_SCRIPT'
import debounce from './modules/debounce.js?v=REPLACED_BY_SCRIPT'
import splitArray from '../global/modules/splitArray.js?v=REPLACED_BY_SCRIPT'

export class Pagination{

    #pageNumberId;
    #options = [];
    #delay = ms => new Promise(res => setTimeout(res, ms));

    // data used to actual generate the table (i.e. where results and page nubmers comes from)
    tableData;
    // data straight from the db
    resultsData;
    // data currently being displayed/viewed
    activeData;

    menuData;
    
    constructor(data={}, baseElementSelector='js-pagination' ){
        this.baseElementSelector = baseElementSelector;
        log('new pagination.js loaded');
        let options = Array.from(document.querySelector(this.baseElementSelector).attributes);
        Object.values(options).forEach(opt=>this.#options.push(opt.name));
        log(this.#options);
        this.data = data;
        return this.#init();
    }

    #noDataOrError(){
        let html = '';
        html += `<div class="box-scrollable bg stats-card radius-md shadow-xs border">`;

        // DUE TO WRAP THE TITLE, SEARCH AND BUTTON CHANGES IN HTML STRUCTURE.
        html += `<div class="table-header padding-y-md padding-x-lg flex justify-between items-center">`;
            html += this.data.title ? `<div class="card-header">${this.data.title}</div>` : '';

            var addClass = this.data.title ? '' : 'width-100';
            html += `<div class="table-options flex justify-between items-center `+addClass+`">`;
                html += `<div class="table-header-button flex items-center">`;

                    if(this.data.customButton){
                        for(let buttons of this.data.customButton){
                            html+=`<a id="${buttons.id}"><button class="create-btn">${buttons.name}</button></a>`;
                        }
                    }
                 html += `</div>`;
            html += `</div>`;
            html += `</div>`;
            html += `<div class="box-scrollable bg stats-card radius-md shadow-xs border
            "><div class="text-component no-data-notification content-padding no-data-div">
            <p class="padding-md">No Data Found</p>
            </div></div>
        `;
      


        document.querySelector(this.baseElementSelector).innerHTML = html;
        console.log('No Data Found');
    }

    async #init(){
        let self=this;
        // this.page = this.data.currentPage ? this.data.currentPage : 1;
        this.page = 1;
        try{
            await this.#getDataResults();
        } catch (e){
            this.#noDataOrError();
        }
        console.log("!this?.resultsData?.length",this?.resultsData?.length);

        if(!this?.resultsData?.length){
            this.#noDataOrError();
            return self;
        }

        this.#setData();

        this.#generateTable(self);
        this.#processResults();
        const paginationLoad = new CustomEvent('PaginationLoaded');
        document.dispatchEvent(paginationLoad);
        return self;
    }

    async #getDataResults(){
            this.resultsData = this.data.postData === {}?
            await this.#getData(this.data.postPath):
            await this.#getData(this.data.postPath,this.data.postData);

        this.page = this.resultsData?.page ?? this.page;
        this.pages = this.resultsData?.pageCount ?? this.pages;
        this.results = this?.pages*this.data.itemsPerPage?
            this?.pages*this.data.itemsPerPage:
            undefined??
            undefined;
        this.resultsData = this.resultsData?.results ?? this.resultsData;

        this.#formatData();
    }

    #setData(){
        this.tableData = this.resultsData;
        this.activeData = this.tableData.slice(this.page-1,this.data.itemsPerPage);
    }

    async #getData(postPath,postData = null){
        if(postData === null){
            return await fetch(postPath,{ method:'POST',
                                 headers:{'Content-Type':'application/json'},
                               })
                          .then(res=>res.json())
                          .catch(res=>false);
        }
        return await fetch(postPath,
                            { method:'POST',
                                headers:{'Content-Type':'application/json'},
                                body:JSON.stringify(postData),
                            })
            .then(res=>res.json())
            .catch(res=>false);
    }

    #generateTable(self){
        //insert main and header
        const options = this.data.pageCounts ? this.data.pageCounts : [10,25,50,100,500,1000];
        console.log(this.data.pageCounts);
        let html = '';
        html += `<div class="box-scrollable bg stats-card radius-md shadow-xs border">`;

        // DUE TO WRAP THE TITLE, SEARCH AND BUTTON CHANGES IN HTML STRUCTURE.
        html += `<div class="table-header padding-y-md padding-x-lg flex justify-between items-center">`;
            html += this.data.title ? `<div class="card-header">${this.data.title}</div>` : '';

            var addClass = this.data.title ? '' : 'width-100';
            html += `<div class="table-options flex justify-between items-center `+addClass+`">
                 <div class="flex justify-start items-center">`;
                if(this.#options.includes('search'))
                    html += this.#htmlGenerator.getSearchHTML;

               if (this.#options.includes("paginationcount")) {
                 html += `<select class="form-control margin-left-sm" id='reset-pagination'>`;
                 options.forEach((ele) => {
                   html += `<option value="${ele}">${ele}</option>`;
                 });
                 html += `</select>`;
               }
               html +=`</div>`;

                html += `<div class="table-header-button flex items-center">`;
                    if(this.data.customButton){
                        for(let buttons of this.data.customButton){
                            html+=`<a id="${buttons.id}"><button class="${buttons.class}">${buttons.name}</button></a>`;
                        }
                    }
                    if(this.#options.includes('download'))
                        html+= this.#htmlGenerator.getDownloadHTML;

                 html += `</div>`;
            html += `</div>`;

        html += `</div>`;

        if(this.#options.includes('refresh'))
            html += this.#htmlGenerator.getRefreshHTML;

        if(this.#options.includes('custom'))
            html+= this.#htmlGenerator.customHTML(this.data.customHTML);

        html+= this.#htmlGenerator.getTableBroilerplateHTML;

        if(this.data.checkboxIdKey)
            html+= this.#htmlGenerator.getFirstCheckboxHTML;

        if(this.data.sortableColumns){

            let i = 0;

            for(let header of this.data.tableHeaders){

                const id = header.replace(/\s+|\s+$/gm,'');
                const classes = "sort nosort"

                let obj = {};
                obj = this.data.sortableColumns.includes(i++)?
                    {header:header+this.#htmlGenerator.isSortable,id,classes}:
                    {header,id,classes:''};

                html+= this.#htmlGenerator.getHeader(obj.header, obj.id, obj.classes);

            }
        }else{
            for(const header of this.data.tableHeaders){
                html+= this.#htmlGenerator.getHeader(header);
            }
        }

        if(this.data.menuDataKeys)
            html+= this.#htmlGenerator.setActionHeader;

        html+= this.#htmlGenerator.getEndHeaderHTML;

		html+= this.#generateRows();

        html+= this.#htmlGenerator.getFooterHTML;

        if(this.data.menuDataKeys !== [])
            html += this.#htmlGenerator.generateMenuHTML(this);

        document.querySelector(this.baseElementSelector).innerHTML = html;

        this.#pageNumberId = document.querySelector('#pagination-list');
        this.#pageNumberId.value = this.page;

        this.#generatePagination();
        this.#setEventListeners(this);
    }
    //  ele = document.querySelector('#change-text');

    #runSort(target, pagination){

        let state = 'no';
        let sort = ()=>{};
        const getId = document.querySelector("#" + target.id.replace(/[()]/g, "\\$&"));

        const upArrow = getId
              .appendChild(Object.assign(document.createElement('svg'),
                                         {innerHTML:pagination.#htmlGenerator.upArrow}));

        const downArrow = getId
              .appendChild(Object.assign(document.createElement('svg'),
                                         {innerHTML:pagination.#htmlGenerator.downArrow}));
        const bothArrow = getId
              .appendChild(Object.assign(document.createElement('svg'),
                                         {innerHTML:pagination.#htmlGenerator.isSortable}));

        let theSparedChild = target.childNodes[0];


        if(target.classList.contains('nosort')){
            state = 'asc';
            sort = pagination.#sortAsc;
            pagination.#swapClass(target, 'nosort', 'sortAsc')
            target.replaceChildren(theSparedChild, upArrow);
        }
        else if(target.classList.contains('sortAsc')){
            state = 'desc';
            sort = pagination.#sortDesc;
            pagination.#swapClass(target, 'sortAsc', 'sortDesc')
            target.replaceChildren(theSparedChild, downArrow);
        }
        else{
            state = 'no';
            pagination.refresh();
            pagination.#swapClass(target, 'sortDesc', 'nosort')
            target.replaceChildren(theSparedChild, bothArrow);
            return;
        }

        pagination.customTable(
            sort(
                pagination.tableData,
                pagination.#getSortingField(
                    target,
                    pagination
                )
            )
        );

        (function gatherChildren(){
            const siblings = Array.from(target.parentElement.children);
            for(const sibling of siblings){
                if(sibling !== target && sibling.classList.contains('sort'))
                    reEducateChild(sibling);
            }
        })();

        function reEducateChild(badChild){
            if(badChild.classList.contains('nosort')) return;

            pagination.#swapClass(badChild, 'sortAsc', 'nosort');
            pagination.#swapClass(badChild, 'sortDesc', 'nosort');

            let theSparedGrandChild = badChild.childNodes[0];
            badChild.replaceChildren(theSparedGrandChild, bothArrow);
        }
    }

    #swapClass(element, oldClass, newClass){
        element.classList.remove(oldClass);
        element.classList.add(newClass);
    }

    #sortAsc(objectArray, field){//a-z
        return objectArray.sort(
            (r1,r2)=>{
            const s1 = (r1[field] + []).toLowerCase();
            const s2 = (r2[field] + []).toLowerCase();
            return (s1>s2)?
                1:
                (s1<s2?
                 -1:
                 0)}
        );
    }

    #sortDesc(objectArray, field){//z-a
        return objectArray.sort(
            (r1,r2)=>{
            const s1 = (r1[field] + []).toLowerCase();
            const s2 = (r2[field] + []).toLowerCase();
            return (s1<s2)?
                1:
                (s1>s2?
                 -1:
                 0)}
        );
    }

    #getSortingField(target, pagination){

            let allArray = pagination.data.tableHeaders;
            let tableHeaders = [];

            for(let i = 0; i < allArray.length; i++)
                tableHeaders[i] = allArray[i].trim().toLowerCase();

            let i = tableHeaders.indexOf(target.innerText.trim().toLowerCase());

            if(-1 === i){console.warn("Item Not Sortable");return;}

            return pagination.data.columnKeys[i];

    }
    

    #setEventListeners(self){
       
        
        self.setEventListener('#forward','click',()=>self.#forward(self));
        self.setEventListener('#backward','click',()=>self.#backward(self));

        const resetPaginationElement = document.getElementById("reset-pagination");
        if (resetPaginationElement){
          self.setEventListener("#reset-pagination", "change", (event) =>
            self.#resetPerPageItem(self,event)
          );
          }
          
        if(self.#options.includes('search'))
            self.setEventListener('#js-pagination-search','keyup',debounce(()=>self.#search(document.querySelector('#js-pagination-search').value.trim())),350);

        // self.setEventListener('#js-pagination-search','keyup',()=>self.#search(document.querySelector('#js-pagination-search').value.trim()));

        if(self.#options.includes('refresh'))
            self.setEventListener('#js-pagination-refresh','click',()=>self.refresh());
        if(self.#options.includes('download'))
            self.setEventListener('#js-pagination-download','click',()=>self.#exportCsv(self));

        if(self.data.sortableColumns){

            let allArray = Array.from(document.querySelectorAll('.sort'));

            for(const el of allArray)
                el.onclick = this.#runSort.bind(self, el, this);

        }

        if(document.querySelector('[aria-label="Select all rows"]')){
            self.setEventListener('[aria-label="Select all rows"]','click',()=>{
                let temp = Array.from(document.querySelectorAll('.js-int-table__select-row'));
                for(const el of temp){
                    el.checked = document.querySelector('[aria-label="Select all rows"]').checked
                    if(el.checked){
                        el.parentElement.parentElement.parentElement.classList.add('int-table__row--checked')
                    }else{
                        el.parentElement.parentElement.parentElement.classList.remove('int-table__row--checked')
                    }
                }
            });

            self.setEventListener('body','click', function (evt) {
                const el = evt.target;
                if (el.className === 'custom-checkbox__input js-int-table__select-row') {
                    if(el.checked){
                        el.parentElement.parentElement.parentElement.classList.add('int-table__row--checked')
                    }else{
                        el.parentElement.parentElement.parentElement.classList.remove('int-table__row--checked')
                    }
                }
            }, false);
        }
    }

  #resetPerPageItem(self,event){
       self.data.itemsPerPage = parseInt(event.target.value);
       self.page = 1;
       self.#processResults();
       self.#generatePagination();
  }
    #generateRows(){
        let html = ''
        let columnKeys = this.data.columnKeys;
        let data = this.activeData;

        for(let i=0;i<data.length;i++){
            html+='<tr class="int-table__row rows_' + i +'">';

            if(this.data.checkboxIdKey)
                html+= this.#htmlGenerator.getCheckboxWithKey(data[i][this.data.checkboxIdKey]);

            for(let j=0;j<columnKeys.length;j++){
                html+=this.#htmlGenerator.getCellHTML(this.data.columnKeys[j],data[i][columnKeys[j]]);
            }

            if(this.data.menuDataKeys){
                let dataString='';
                let style='';
                let dataIds = ['',''];
                for(const key of this.data.menuDataKeys)
                    dataString+=` data-${key}="${data[i][key]}"`
                    
                    if(this.data.menuItems.length == 0) 
                        style+= 'style="display:none"';
                    
                    if(this.data.menuDataIds)
                        dataIds = this.data.menuDataIds;

                html+=this.#htmlGenerator.get3DotMenuHTML(dataString,style,dataIds,this.data.viewAssets);
            }

            html+='</tr>'
            
            if(!!(this.data.subrows) && this.data.postPath == '/assetManagement/getAssetGroupsWithServiceCount') {
                html+=`<tr style='width:100% !important' id="childNode_` + i +`" class="expandable-row  expand` + i +`"><td colspan="3"> <table class="int-table__table">
                    <thead class="int-table__header js-int-table__header">
                        <tr class="int-table__row border-0">
                            <th id="header-GroupName" class="int-table__cell sort nosort int-table__cell--th text-center">
                                Servers Count
                            </th>
                
                            <th id="header-GroupName" class="int-table__cell sort nosort int-table__cell--th text-center">
                                SIP Trunks
                            </th>
                       
                            <th id="header-GroupName" class="int-table__cell sort nosort int-table__cell--th text-center">
                                DIDS COUNT
                            </th>
                      
                            <th id="header-GroupName" class="int-table__cell sort nosort int-table__cell--th text-center">
                                ENTERPRISE FAX
                            </th>
                            <th id="header-GroupName" class="int-table__cell sort nosort int-table__cell--th text-center">
                                IFAX.PRO
                            </th>
                            <th id="header-GroupName" class="int-table__cell sort nosort int-table__cell--th text-center">
                                UNCONFIGURED FAX
                            </th>
                        </tr>
                    </thead>
                    <tbody class="int-table__body js-int-table__body" id="table-body">
                        <tr class="int-table__row border-0">
                            <td class="int-table__cell name text-center" roll="cell">
                                ` + data[i]['serverServiceCount'] +`
                            </td> <td style="display: none"></td>
                            <td class="int-table__cell name text-center" roll="cell">
                                ` + data[i]['siptrunkCount'] +`
                            </td>
                            <td class="int-table__cell name text-center" roll="cell">
                                ` + data[i]['didsServiceCount'] +`
                            </td>
                            <td class="int-table__cell name text-center" roll="cell">
                                ` + data[i]['ifaxServiceCount'] +`
                            </td>
                            <td class="int-table__cell name text-center" roll="cell">
                                ` + data[i]['vfaxServiceCount'] +`
                            </td>
                            <td class="int-table__cell name text-center" roll="cell">
                                ` + data[i]['unconfiguredServiceCount'] +`
                            </td>
                        </tr>
                    <tbody>
                </table>
                </td></tr>`;
            };
        }
       
        return html;
    }

    async refresh(page=1,callback=null){
        const search = document.querySelector('#js-pagination-search')?.value.trim() ?? '';
        // let page = 1;
        var activePageElement = document.querySelector('.active-page');
        if (activePageElement) {
            page = activePageElement.querySelector('div').textContent;
        }
        
        await this.#init();
        '' === search?
            this.#jump(this,page):
            (this.#search(search,page),
            document
                .querySelector('#js-pagination-search')
                .value = search) 
     if (callback && typeof callback === "function") {
        callback();
      }
    }

    #setResultsAndPageNumber(){
        
        this.results = this.tableData.length;

        let perPage = this.data.itemsPerPage;
		if(this.#check2display() && document.querySelector('#js-pagination-search').value.trim() === ''){
			document.querySelector('#table-body').innerHTML = this.#generateRows(this.activeData)
			document.querySelector('#results').innerText = `0 Results`;
            document.querySelector('#totalResult').innerText = ``;

            
		} else {
            if(this.activeData.length <= perPage)
            perPage = this.activeData.length;
			document.querySelector('#table-body').innerHTML = this.#generateRows(this.activeData)
			document.querySelector('#results').innerText = `Showing ${perPage} Out of`;
            document.querySelector('#totalResult').innerText = `${this.tableData.length} Results`;

		}
    }

    #processResults(){
        this.#formatVisual();

        let from = (this.page-1)*this.data.itemsPerPage;
        let to = from + this.data.itemsPerPage;

        this.activeData = this.tableData.slice(from,to);

		if(this.#check2display() && document.querySelector('#js-pagination-search').value.trim() === ''){
			this.activeData = [];
		}

        this.#pageNumberId.value = this.page;
        this.#setResultsAndPageNumber();

        if(this.data.menuItems){
            this.#initMenu();

            let testArr = Array.from(document.getElementsByClassName('js-pagination-menu'));
            for(const item of testArr){
                item.addEventListener('click',(e)=>{
                    this.menuData = {...item.dataset};
                });
            }
        }
    }

    #forward(obj){
       
        if (this.page < this.pages) {
            const currentPageId = '#' + this.page;
            const nextPageId = '#' + (this.page + 1);
        
            if($(currentPageId).hasClass('active-page')) {
                $(currentPageId).removeClass('active-page');
                $(nextPageId).addClass('active-page');
            }
        }
        if(this.page >= this.pages) return;
        this.#hideMenu();
        this.page++;
        this.#generatePagination();
        obj.#processResults();
        this.#setEventListeners(this);

    }
    #backward(obj){
        if (this.page > 1) {
            const currentPageId = '#' + this.page;
            const previousPageId = '#' + (this.page - 1);
        
            if ($(currentPageId).hasClass('active-page')) {
                $(currentPageId).removeClass('active-page');
                $(previousPageId).addClass('active-page');
            }
        }
        if(this.page <= 1) return;
        this.#hideMenu();
        this.page--;
        this.#generatePagination();
        obj.#processResults();
        this.#setEventListeners(this);

    }
    #generatePagination() {
        let perPage = this.data.itemsPerPage;
        this.pages = Math.ceil(this.tableData.length/perPage);
        let totalPages = this.pages;
        let currentPage = this.page;
        let visibleLinks = 5;
        const paginationElement = document.getElementById("pagination-list");
        paginationElement.innerHTML = ""; // Clear the previous pagination
    
        const prevButton = this.#createNavigationButton("Prev", currentPage, totalPages, visibleLinks, -1);
        paginationElement.appendChild(prevButton);
    
        for (let i = 1; i <= totalPages; i++) {
            if (i === 1 || i === totalPages || Math.abs(i - currentPage) <= visibleLinks - 1) {
                const li = document.createElement("li");
                li.className = "page_number curser_pointer";
                li.setAttribute("value", i);
                li.id = i;
        
                const span = document.createElement("span");
                span.className = "pagination__jumper flex items-center";
        
                const div = document.createElement("div");
                div.className = "flex justify-center items-center";
                div.textContent = i;
        
                span.appendChild(div);
                li.appendChild(span);
        
                if (i === currentPage) {
                    li.classList.add("active-page");
                }
        
                li.addEventListener("click", () => this.#goToPage(i));
        
                paginationElement.appendChild(li);
            } else if (paginationElement.lastChild && paginationElement.lastChild.textContent !== "...") {
                const li = document.createElement("li");
                li.className = "page_number";
                li.setAttribute("value", "");
        
                const span = document.createElement("span");
                span.className = "pagination__jumper flex items-center";
        
                const div = document.createElement("div");
                div.className = "flex justify-center items-center";
                div.textContent = "...";
        
                span.appendChild(div);
                li.appendChild(span);
        
                paginationElement.appendChild(li);
            }
        }
    
        const nextButton = this.#createNavigationButton("Next", currentPage, totalPages, visibleLinks, 1);
        paginationElement.appendChild(nextButton);
    }
    #goToPage(value){
        this.page = value;
        this.#pageNumberId.value = this.page;
        this.#hideMenu();
        this.#generatePagination();
        this.#processResults();
        this.#setEventListeners(this);
        localStorage.setItem("currentPage", this.page);
    }
    #createNavigationButton(label, currentPage, totalPages, visibleLinks, direction) {
        const button = document.createElement("li");
    
        const a = document.createElement("a");
        a.className = "pagination__item flex";
        a.setAttribute("id", direction === -1 ? "backward" : "forward");
        a.setAttribute("value", "");
        if(direction === -1){
            a.innerHTML = `
                <svg width="11" height="18" viewBox="0 0 11 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path fill-rule="evenodd" clip-rule="evenodd" d="M8.6518 17.3263C8.75924 17.4337 8.90491 17.494 9.0568 17.494C9.20868 17.494 9.35435 17.4337 9.4618 17.3263L10.2718 16.5163C10.3792 16.4089 10.4395 16.2632 10.4395 16.1113C10.4395 15.9594 10.3792 15.8138 10.2718 15.7063L3.4658 8.89932L10.2718 2.09332C10.3792 1.98588 10.4395 1.8402 10.4395 1.68832C10.4395 1.53644 10.3792 1.39076 10.2718 1.28332L9.4618 0.47332C9.35435 0.365967 9.20868 0.305664 9.0568 0.305664C8.90491 0.305664 8.75924 0.365967 8.6518 0.47332L0.629797 8.49532C0.522444 8.60276 0.462142 8.74844 0.462142 8.90032C0.462142 9.05221 0.522444 9.19788 0.629797 9.30532L8.6518 17.3263Z" fill="#A0B5BE"></path>
                </svg>
            `;
        }else{
        a.innerHTML = `
            <svg width="11" height="18" viewBox="0 0 11 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path fill-rule="evenodd" clip-rule="evenodd" d="M2.4432 17.3263C2.33576 17.4337 2.19009 17.494 2.0382 17.494C1.88632 17.494 1.74065 17.4337 1.6332 17.3263L0.823204 16.5163C0.715851 16.4089 0.655548 16.2632 0.655548 16.1113C0.655548 15.9594 0.715851 15.8138 0.823204 15.7063L7.6312 8.89932L0.822204 2.09332C0.71485 1.98588 0.654548 1.8402 0.654548 1.68832C0.654548 1.53644 0.71485 1.39076 0.822204 1.28332L1.6312 0.47332C1.73865 0.365967 1.88432 0.305664 2.0362 0.305664C2.18809 0.305664 2.33376 0.365967 2.4412 0.47332L10.4632 8.49532C10.5706 8.60276 10.6309 8.74844 10.6309 8.90032C10.6309 9.05221 10.5706 9.19788 10.4632 9.30532L2.4432 17.3263Z" fill="#A0B5BE"></path>
            </svg>
        `;
        }
      
    
        button.appendChild(a);
        return button;
    }

    #jump(obj,pageNumber){
        if(pageNumber === '') return;
        let page = this.page;
        if(page > this.pages || page < 1){
            this.#pageNumberId.value = this.page;
            return false;
        }
        this.page = pageNumber;
        this.#hideMenu();
        this.#generatePagination();
        obj.#processResults();
        this.setEventListener('#forward','click',()=>this.#forward(this));
        this.setEventListener('#backward','click',()=>this.#backward(this));

    }
	
	#check2display(){
		// log(this.#options.includes('defaulthide'))
		return this.#options.includes('defaulthide');
	}

    async #search(string, page = 1, objectArray = this.resultsData){
        console.log('Starting search with string:', string);
        console.log('Object array:', objectArray);

        if(string === ''){
            this.tableData = this.resultsData;
        }else{
            let tempArray = splitArray(objectArray);
            this.tableData = await generateWorkers(string,tempArray,this.data.columnKeys);
        }
        this.page = 1;
        this.#hideMenu();
        this.#generatePagination();
        this.#processResults();
        this.setEventListener('#forward','click',()=>this.#forward(this));
        this.setEventListener('#backward','click',()=>this.#backward(this));
        console.log('tableData after await:', this.tableData);
        console.log('Ending search');

    }

    customTable(objectArray){
        this.tableData=objectArray;
        this.#processResults();
        document.querySelector('#js-pagination-search').value !== ''?
            this.#search(document.querySelector('#js-pagination-search').value,1,this.tableData):
            this.#jump(this,1);
    }

    #makeCsv(self){
        let csv = []
        csv.push(self.data.tableHeaders.slice(0,self.data.columnKeys.length))
        for(const item of self.tableData){
            let newRow = [];
            for(const key of self.data.columnKeys){
                newRow.push(item[key]);
            }
            csv.push(newRow);
        }
        return csv;
    }

    #exportCsv(){
        let name = new Date().getTime();
        downloadCsv(this.#makeCsv(this),name,document.querySelector('#js-pagination-download'));
    }

    #initMenu(){
        new Menu(document.querySelector('#menu-auto-gen'));
    }


    #formatData(){
        if(this.data.formatData)
            this.data.formatData(this.resultsData)
    }
    async #formatVisual(){
        if(this.data.formatVisual)
            await this.#delay(1),this.data.formatVisual(this.activeData)
    }

    setEventListener(elementIdentifier,action,callback){
        document.querySelector(elementIdentifier).addEventListener(action,callback);
    }

    #hideMenu(){
        document.querySelector('#menu-auto-gen').classList.remove('menu--is-visible');
    }

    #htmlGenerator = {
        getHeader:(header, id='', classes = '')=>`<th id="header-${id}" class="int-table__cell ${classes} int-table__cell--th text-left">${header}</th>`,
        getSearchHTML:'<div class="search-bar flex justify-start items-center"><img src="/public/img-new/search-small.svg"><input type="text" placeholder="Search..." class="form-control" id="js-pagination-search"></div>',
        getRefreshHTML:'<i class="refresh" id="js-pagination-refresh" style="margin-left:10px,"></i>',
        getDownloadHTML:'<a id="js-pagination-download"><button class="download-btn">Download CSV</button></a>',
        getTableBroilerplateHTML:`
        <div id="interactive-table-1" class="int-table text-sm js-int-table">
            <div class="int-table__inner">
              <table class="int-table__table" aria-label="Interactive table example">
                <thead class="int-table__header js-int-table__header">
                  <tr class="int-table__row">`,
        getFirstCheckboxHTML:`
            <td class="int-table__cell">
                <div class="checkbox-group-area d-flex justify-start align-center">
                    <div class="d-flex justify-start align-center">
                        <label class="custom-checkbox">
                            <input type="checkbox" class="checkbox js-int-table__select-all" name="checkbox">
                            <span class="checkmark"></span>
                        </label>
                    </div>
                </div>
            </td>
        `,
        setActionHeader: `<th class="int-table__cell int-table__cell--th text-left">Actions</th>`,
        getEndHeaderHTML:`
                </tr>
                </thead>
                <tbody class="int-table__body js-int-table__body" id="table-body">`,
        getFooterHTML:`
                    </tbody>
                </table>
            </div>
        </div>
    </div>

    <div class="pagination flex justify-end items-center margin-top-md">
        <p class="results"><span id="results">Showing 6 Out of</span><span class="dark-text" id="totalResult"> 30 Results</span></p>
        <ul class="pagination__list flex justify-start items-center" id="pagination-list">
        </ul>
    </div>

    `,
        getCheckboxWithKey:(key)=>
        `
            <th class="int-table__cell" scope="row">
                <div class="checkbox-group-area d-flex justify-start align-center">
                    <div class="d-flex justify-start align-center">
                        <label class="custom-checkbox">
                            <input id="${key}" type="checkbox" class="checkbox js-int-table__select-row" name="checkbox">
                            <span class="checkmark"></span>
                        </label>
                    </div>
                </div>
            </th>
        `,
        getCellHTML:(cellClass,cellText)=>`<td class="int-table__cell ${cellClass} text-left" roll="cell">
                            ${(cellText + []).trim().replace('  ', ' ')}
                        </td>`,
        get3DotMenuHTML:(dataString,style,menuDataIds,viewAssets)=>{

            let html = `<td class="int-table__cell">
                            <div class="table-actions flex justify-start items-center">`;
            if(!!(viewAssets))
            html += `<div class="view-asset assetmessage">
                        <a href="javascript:void(0)" class="">
                            View Asset
                        </a>
                    </div>`;
                  
            if(menuDataIds[0]!= '')
                  html +=`<button ${dataString.trim().replace('  ', ' ')} class="edit bg-transparent js-pagination-menu" id="${menuDataIds[0]}">
                        <svg width="20" height="21" viewBox="0 0 20 21" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M3.10988 20.8999C2.48448 20.8992 1.88477 20.6379 1.44184 20.173C0.998904 19.7081 0.748765 19.0775 0.746094 18.419L0.746094 4.47556C0.748765 3.81707 0.998904 3.18648 1.44184 2.7216C1.88477 2.25673 2.48448 1.99538 3.10988 1.99468H8.10024C8.2666 1.99416 8.43014 2.03989 8.57433 2.12725C8.71852 2.21461 8.83826 2.34049 8.92144 2.49219C9.00223 2.64372 9.04466 2.81458 9.04466 2.98836C9.04466 3.16214 9.00223 3.333 8.92144 3.48454C8.83826 3.63623 8.71852 3.76212 8.57433 3.84948C8.43014 3.93683 8.2666 3.98256 8.10024 3.98204H3.10988C3.04802 3.98151 2.98668 3.99395 2.92943 4.01863C2.87218 4.04331 2.82017 4.07974 2.77643 4.1258C2.73269 4.17185 2.69809 4.22662 2.67465 4.28689C2.65121 4.34717 2.6394 4.41176 2.6399 4.47689V18.419C2.63923 18.4843 2.65091 18.5491 2.67426 18.6096C2.69761 18.6701 2.73216 18.7251 2.7759 18.7714C2.81965 18.8178 2.8717 18.8544 2.92904 18.8793C2.98638 18.9042 3.04785 18.9169 3.10988 18.9165H16.3489C16.4766 18.9174 16.5996 18.8653 16.6912 18.7715C16.776 18.6762 16.8214 18.5495 16.8176 18.419V13.1606C16.8191 12.9857 16.8642 12.8142 16.9482 12.6632C17.0322 12.5122 17.1522 12.387 17.2964 12.3C17.4378 12.2128 17.5987 12.1668 17.7626 12.1668C17.9265 12.1668 18.0874 12.2128 18.2288 12.3C18.3733 12.3864 18.4938 12.5113 18.5783 12.662C18.6627 12.8128 18.7082 12.9843 18.7101 13.1593V18.419C18.7078 19.0776 18.4577 19.7084 18.0147 20.1734C17.5717 20.6383 16.9718 20.8996 16.3463 20.8999H3.10988ZM7.22724 15.5657C6.85225 15.5624 6.49188 15.4121 6.21654 15.144C6.06085 14.9709 5.94556 14.7621 5.87978 14.5339C5.814 14.3058 5.79953 14.0647 5.83752 13.8297L6.40604 10.1822L14.5309 1.62222C14.9796 1.15919 15.5829 0.899857 16.2111 0.899902C16.8349 0.900038 17.4334 1.15965 17.8763 1.62222L19.0651 2.86199C19.5012 3.33384 19.7451 3.9662 19.7451 4.62454C19.7451 5.28289 19.5012 5.91525 19.0651 6.3871L10.929 14.9684L7.46728 15.5657H7.22724ZM8.17352 11.1254L7.7945 13.4812L10.0294 13.0821L16.5093 6.2594L14.6559 4.30263L8.17352 11.1254ZM17.8409 4.82142C17.871 4.72745 17.8751 4.62641 17.8528 4.53007C17.8304 4.43373 17.7825 4.34609 17.7146 4.27736L16.5396 3.03625C16.4978 2.99065 16.4464 2.95588 16.3897 2.93464C16.3329 2.91341 16.2722 2.9063 16.2124 2.91387H16.0229L17.8409 4.82142Z" fill="#0A9EF2"/>
                        </svg>                    
                    </button>`;
            if(menuDataIds[1]!= '')
                html +=`<button ${dataString.trim().replace('  ', ' ')} class="delete bg-transparent js-pagination-menu" id="${menuDataIds[1]}">
                        <svg width="18" height="21" viewBox="0 0 18 21" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M1.14062 4.95698H17.2714M15.5734 5.80597V17.6918C15.5734 18.3673 15.3051 19.0151 14.8274 19.4928C14.3498 19.9704 13.7019 20.2387 13.0264 20.2387H5.38556C4.71006 20.2387 4.06223 19.9704 3.58459 19.4928C3.10694 19.0151 2.8386 18.3673 2.8386 17.6918V5.80597M7.08353 4.95698V2.41002C7.08353 2.18486 7.17298 1.96891 7.33219 1.8097C7.49141 1.65048 7.70735 1.56104 7.93252 1.56104H10.4795C10.7046 1.56104 10.9206 1.65048 11.0798 1.8097C11.239 1.96891 11.3285 2.18486 11.3285 2.41002V4.95698M7.08353 9.20191V15.1448M11.3285 9.20191V15.1448" stroke="#E33429" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                    </button>`;
            if(menuDataIds[2] != '' && (menuDataIds[2] == 'message' || menuDataIds[2] == 'send-message' ))
            html +=`<button ${dataString.trim().replace('  ', ' ')}  id="${menuDataIds[2]}" class="message bg-transparent js-pagination-menu">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M18.5688 12.8015C18.5688 13.3213 18.3604 13.8199 17.9894 14.1874C17.6185 14.555 17.1154 14.7615 16.5908 14.7615H4.72302L0.76709 18.6815V3.0015C0.76709 2.48168 0.975482 1.98315 1.34642 1.61557C1.71736 1.248 2.22047 1.0415 2.74505 1.0415H16.5908C17.1154 1.0415 17.6185 1.248 17.9894 1.61557C18.3604 1.98315 18.5688 2.48168 18.5688 3.0015V12.8015Z" stroke="var(--primary-color)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg> 
                </button>`;
           
                html +=`<button ${dataString.trim().replace('  ', ' ')} class="bg-transparent float-left js-pagination-menu js-tab-focus"  aria-haspopup="true" aria-expanded="false" data-label="Edit row" aria-controls="menu-auto-gen" ${style}>
                        <svg width="5" height="20" viewBox="0 0 5 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M2.5119 7.20299C1.57462 7.20299 0.814806 7.9628 0.814806 8.90008C0.814806 9.83736 1.57462 10.5972 2.5119 10.5972C3.44917 10.5972 4.20898 9.83736 4.20898 8.90008C4.20898 7.9628 3.44917 7.20299 2.5119 7.20299Z" fill="var(--gray-color)"/>
                        <path d="M2.5119 13.9911C1.57462 13.9911 0.814806 14.7509 0.814806 15.6882C0.814806 16.6254 1.57462 17.3853 2.5119 17.3853C3.44917 17.3853 4.20898 16.6254 4.20898 15.6882C4.20898 14.7509 3.44917 13.9911 2.5119 13.9911Z" fill="var(--gray-color)"/>
                        <path d="M2.5119 0.414903C1.57462 0.414903 0.814806 1.17472 0.814806 2.11199C0.814806 3.04927 1.57462 3.80908 2.5119 3.80908C3.44917 3.80908 4.20898 3.04927 4.20898 2.11199C4.20898 1.17472 3.44917 0.414904 2.5119 0.414903Z" fill="var(--gray-color)"/>
                        </svg>
                    </button>`;
                html +=`</div>
                </td>`;
            
        return html;
    },
        customHTML:(customHTML)=>`${customHTML}`,
        generateMenuHTML:(self)=>{
            let html = '<menu id="menu-auto-gen" class="menu js-menu" data-scrollable-element=".js-app-ui__body">';
            if(self.data.menuItems)
                for(const item of self.data.menuItems){
                    html += `
                        <li id="${item.id}" role="menuitem">
                        <span id="${item.id}-anchor" class="menu__content js-menu__content">
                            <i class="${item.svg}"></i>
                            <span>${item.name}</span>
                        </span>
                        </li>`;
                }
            return html += '</menu>'
        },
        upArrow:`
        <svg width="10" height="15" viewBox="0 0 10 15" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M5.3217 13.3391V1.20972M5.3217 1.20972L1.53125 5.37921M5.3217 1.20972L9.11214 5.37921" stroke="var(--gray-color)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        `,
        downArrow:`
        <svg width="10" height="15" viewBox="0 0 10 15" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M4.73966 1.20972V13.3391M4.73966 13.3391L0.949219 9.16965M4.73966 13.3391L8.53011 9.16965" stroke="var(--gray-color)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>        
        `,
        isSortable:`
        <svg width="17" height="15" viewBox="0 0 17 15" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M4.73966 1.20972V13.3391M4.73966 13.3391L0.949219 9.16965M4.73966 13.3391L8.53011 9.16965" stroke="var(--gray-color)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M12.3217 13.3391V1.20972M12.3217 1.20972L8.53125 5.37921M12.3217 1.20972L16.1121 5.37921" stroke="var(--gray-color)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        
        `,
    }
}

export class PhpPagination extends Pagination {
    constructor(data){

        (async ()=>{
            const pagination = await super(data);
            const phpPagination = this;
            console.log("pagination"+phpPagination);
            phpPagination.#init(pagination,phpPagination);
            console.log("PHP pagination"+phpPagination);

        })();
    }

    #init(pagination,phpPagination){

        pagination.setEventListener('#forward','click',this.#phpForward.bind(self,pagination,phpPagination));
        pagination.setEventListener('#backward','click',this.#phpBackward.bind(self,pagination,phpPagination));
    }

    async #phpForward(pagination,phpPagination){
        pagination.data.postData ={page:pagination.page,itemsPerPage:pagination.data.itemsPerPage};
        log(pagination.data.postData);
        await pagination.refresh();
        phpPagination.#init(pagination,phpPagination);
    }

    async #phpBackward(pagination,phpPagination){
        pagination.data.postData ={page:pagination.page,itemsPerPage:pagination.data.itemsPerPage};
        log(pagination.data.postData);
        await pagination.refresh();
        phpPagination.#init(pagination,phpPagination);
    }
}
document.onkeyup = function(e){
    if(e.which == 27){
        document.querySelector('#menu-auto-gen').classList.remove('menu--is-visible');
        log('test')
    }
}

document.body.addEventListener('click', function(event) {
    const isButtonClicked = event.target.closest('button[aria-controls="menu-auto-gen"]');
    if (isButtonClicked) {
        return;
    }
    const menuAutoGen = document.querySelector('#menu-auto-gen');
    if (menuAutoGen) {
        if (menuAutoGen.classList.contains('menu--is-visible')) {
            menuAutoGen.classList.remove('menu--is-visible');
        }
    }
});

function addEventListenerToSelectAll() {
    var selectAllCheckbox = document.querySelector('.js-int-table__select-all');

    if (selectAllCheckbox) {
        selectAllCheckbox.addEventListener('change', function () {
            var rowCheckboxes = document.querySelectorAll('.js-int-table__select-row');
            rowCheckboxes.forEach(function (checkbox) {
                checkbox.checked = selectAllCheckbox.checked;
            });
        });
    }
}

var observer = new MutationObserver(function (mutations) {
    mutations.forEach(function (mutation) {
        if (mutation.addedNodes.length > 0) {
            // Run the function each time nodes are added to the document
            addEventListenerToSelectAll();
        }
    });
});

observer.observe(document.body, { childList: true, subtree: true });