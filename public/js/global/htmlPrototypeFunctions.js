/** This file is for custom HTML prototype functions/overrides */

//The following replace one class with another in js and jquery
Object.getPrototypeOf($()).replaceClass = function(class1,class2){
    this.removeClass(class1)
        .addClass(class2);
};

HTMLElement.prototype.replaceClass = function(class1,class2){
    this.classList.remove(class1)
    this.classList.add(class2)
}
