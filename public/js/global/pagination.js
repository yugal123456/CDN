console.log('pagination.js loaded')

/*
 * Class for generating paginated table bodies
 *
 * Requirements:
 *      DOM elements with the ids page-number, results, and table-body must exist for
 *          functions to work
 *
 * @param {String}  postPath       The path to get the information to be paginated
 * @param {jQueryDOMElement}  insertLocation Where you want the table to be inserted
 * @param {jQueryDOMElement}  pageNumberId Where you want the page numbers to be inserted and read from
 * @param {jQueryDOMElement}  resultsDisplay Where you want the result numbers to be inserted
 * @param {jQueryDOMElement}  numberOfPages Where you want the page numbers to be inserted and read from
 * @param {Boolean} isInteractive  Is the table being generated interactive or not? (used for css classes)
 * @param {Array}   objectArray    An array of properties to extract from the JS Object and display in table
 * @param {Array}   actionMenu     An array of data to send to the Menu, if array is empty, menu is not generated
 * @param {String}  menuId         id for popupmenu
 * @param {Number}  resultsPerPage The number of Results to be displayed on each page, default of 10
 * @param {Object}  data           data for post request
 * @param {String}  checkboxId     Id/name selector for int-tables checkboxes
 */
class Pagination {


    constructor(postPath,
                insertLocation,
                pageNumberId,
                resultsDisplay,
                numberOfPages,
                isInteractive,
                objectArray,
                actionMenu=[],
                menuId='',
                resultsPerPage = 10,
                data={},
                checkboxId='') {
        this.resArray = [];
        this.searchArray = [];
        this.activeArray = [];
        this.numberResults = 0;
        this.pages = 0;
        this.pageNumber = 1;
        this.resultsPerPage = resultsPerPage;
        this.objectArray = objectArray;
        this.actionMenu = actionMenu;
        this.isInteractive = isInteractive;
        this.menuId = menuId;
        this.pageNumberId = pageNumberId;
        this.insertLocation = insertLocation;
        this.resultsDisplay = resultsDisplay;
        this.data = data;
        this.postPath = postPath;
        this.numberOfPages = numberOfPages;
        this.checkboxId = checkboxId;
        this.getResults();
        return this;
    }

    getResults(){
        if(Object.keys(this.data).length !== 0){
            $.post(postPath).done((res)=>{
                this.resArray = JSON.parse(res);
                this.activeArray = this.resArray;
                this.processResults(this.resArray, this.pageNumber)
            });
            return this;
        }
        $.post(this.postPath,this.data).done((res)=>{
            this.resArray = JSON.parse(res);
            this.activeArray = this.resArray;
            this.processResults(this.resArray, this.pageNumber)
        });

    }

    outTag(obj){
        if(this.isInteractive){
            let tableString ='<tr class="int-table__row">';

            if(this.checkboxId !== ''){
                tableString += `
                    <th class="int-table__cell" scope="row">
                      <div class="custom-checkbox int-table__checkbox">
                        <input id="${obj[this.checkboxId]}" name="${obj[this.checkboxId]}" class="custom-checkbox__input js-int-table__select-row" type="checkbox" aria-label="Select this row"/>
                        <div class="custom-checkbox__control" aria-hidden="true"></div>
                      </div>
                    </th>
                `;
                let html = `

                `;
            }
            this.objectArray.forEach((element) =>{
                tableString += `<td class="int-table__cell ${element} text-left" role="cell">${obj[element] != '' ? obj[element] : 'N/A'}</td>`
            });
            if(this.actionMenu.length != 0){
                tableString += '<td class="int-table__cell text-left" role="cell"><button'
            this.actionMenu.forEach((element) =>{
                tableString += ` data-${element}="${obj[element]}"`
            });
            tableString += `class="reset js-special-menu did-selector int-table__menu-btn margin-left-auto js-tab-focus" aria-controls="menu-${this.menuId}" aria-haspopup="true" aria-expanded="false">
                                <svg class="icon" viewBox="0 0 16 16"><circle cx="8" cy="7.5" r="1.5" /><circle cx="1.5" cy="7.5" r="1.5" /><circle cx="14.5" cy="7.5" r="1.5" /></svg>
                                </button>
                                </td>`;

            }
            tableString += "</td></tr>"
            return tableString;
        }
        let tableString ='<tr class="tbl__row">';
        this.objectArray.forEach((element) =>{
            tableString += `<td class="tbl__cell ${element} text-left" role="cell">${obj[element]}</td>`
        });
        if(this.actionMenu.length != 0){
            tableString += '<td class="tbl__cell text-left" role="cell"><button'
          this.actionMenu.forEach((element) =>{
            tableString += ` data-${element}="${obj[element]} "`
          });
          tableString += `class="reset js-special-menu did-selector int-table__menu-btn margin-left-auto js-tab-focus" aria-controls="menu-${this.menuId}" aria-haspopup="true" aria-expanded="false">
                            <svg class="icon" viewBox="0 0 16 16"><circle cx="8" cy="7.5" r="1.5" /><circle cx="1.5" cy="7.5" r="1.5" /><circle cx="14.5" cy="7.5" r="1.5" /></svg>
                            </button>
                            </td>`;

        }
        tableString += "</td></tr>"
        return tableString;
    }

    getPageIndex(page){
    let firstIndex = (page - 1) * this.resultsPerPage;
    let lastIndex = firstIndex + this.resultsPerPage;
    let data = {
        firstIndex,
        lastIndex
    }
    return data;
    }

    search(searchId){
        this.pageNumber = 1;
        this.pageNumberId.val(this.pageNumber);
        let string = searchId.val().toLowerCase();
        this.searchArray = [];
        if(string === ''){
            this.activeArray = this.resArray;
            this.processResults(this.activeArray, this.pageNumber, this.pageNumberId);
            return;
        }
        this.resArray.forEach((obj)=>{
            let flag = false;
            this.objectArray.forEach((value)=>{
                flag = (obj[value] + []).toLowerCase().includes(string);
                if(flag){
                    this.searchArray.push(obj);
                }
            });
        });
        let temp = new Set(this.searchArray);
        this.searchArray = Array.from(temp);
        this.activeArray = this.searchArray;
        console.log(this.searchArray);
        this.processResults(this.searchArray, this.pageNumber, this.pageNumberId);
    }

    gotoPage() {
        this.pageNumber = this.pageNumberId.val()
        if(this.pageNumber > this.pages || this.pageNumber < 1)
            return false;
        this.processResults(this.activeArray, this.pageNumber, this.pageNumberId);
        return true;
    };

    processResults(results, page){
        this.numberResults = results.length;
        this.pages = Math.ceil(this.numberResults / this.resultsPerPage);
        this.pageNumberId.val(this.pageNumber);
        let span = this.getPageIndex(page);
        this.numberOfPages.text(`of ${this.pages}`)
        this.resultsDisplay.text(`${this.numberResults} Results`)
        let str = '';
        results.slice(span.firstIndex, span.lastIndex).forEach(element => {
            //if(element.type == 1)
          str += this.outTag(element);
        });
        this.insertLocation.html(str);
        if(this.menu !== '')
            new Menu(document.getElementById(`menu-${this.menuId}`));
    };

    backward(){
        if(this.pageNumber <= 1) return false;
        this.pageNumber--;
        this.pageNumberId.val(this.pageNumber);
        this.processResults(this.activeArray, this.pageNumber, this.pageNumberId);
        return true;
    }

    forward(){
        if(this.pageNumber >= this.pages) return false;
        this.pageNumber++;
        this.pageNumberId.val(this.pageNumber);
        this.processResults(this.activeArray, this.pageNumber, this.pageNumberId);
        return true;
    }

}
