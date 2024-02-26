// File#: _1_floating-action-button
// Usage: codyhouse.co/license
(function () {
    var Fab = function (element) {
        this.element = element;
        this.fabButton = this.element.getElementsByClassName('js-fab__btn');
        this.fabPopover = this.element.getElementsByClassName('js-fab__popover');
        this.fabPopoverInner = this.element.getElementsByClassName('js-fab__popover-inner');
        this.visibleClass = 'fab--active';
        this.animating = false;
        // focusable elements
        this.firstFocusable = false;
        this.lastFocusable = false;
        // offset variables
        this.offsetIn = 0;
        this.offsetOut = 0;
        this.targetIn = this.element.getAttribute('data-target-in') ? document.querySelector(this.element.getAttribute('data-target-in')) : false;
        this.targetOut = this.element.getAttribute('data-target-out') ? document.querySelector(this.element.getAttribute('data-target-out')) : false;
        if (this.fabButton.length < 1 || this.fabPopover.length < 1) return;
        initFab(this);
    };

    // public methods
    Fab.prototype.setVariables = function () {
        setFabVariables(this);
    };

    Fab.prototype.resetVisibility = function () {
        resetFabVisibility(this);
    };

    // private methods
    function initFab(element) {
        resetFabVisibility(element);
        setFabVariables(element);
        initFabEvents(element);
    };

    function setFabVariables(element) {
        // set CSS variables
        element.fabPopoverInner[0].style.height = '';
        var height = element.fabPopover[0].offsetHeight + 'px';

        element.element.style.setProperty('--fab-popover-height', height);
        element.fabPopoverInner[0].style.height = height;
    };

    function initFabEvents(element) {
        if (document.fonts) {
            // wait for fonts to be loaded and set popover height
            document.fonts.ready.then(function () {
                setFabVariables(element);
            });
        }

        // toggle popover when clicking on fab button
        element.fabButton[0].addEventListener('click', function () {
            if (element.animating) return;
            element.animating = true;
            toggleFab(element);
        });

        // close popover when clicking on fab background
        element.element.addEventListener('click', function (event) {
            if (!event.target.closest('.js-fab__btn') && !event.target.closest('.js-fab__popover-inner')) toggleFab(element);
        });

        // trap focus
        element.element.addEventListener('keydown', function (event) {
            if (event.keyCode && event.keyCode == 9 || event.key && event.key == 'Tab') {
                //trap focus inside popover
                trapFocus(element, event);
            } else if (event.keyCode && event.keyCode == 27 || event.key && event.key.toLowerCase() == 'escape') {
                if (Util.hasClass(element.element, element.visibleClass)) toggleFab(element);
            }
        });
    };

    function toggleFab(element) {
        var isOpen = Util.hasClass(element.element, element.visibleClass);

        if (isOpen) {
            Util.removeClass(element.element, element.visibleClass);
            element.fabButton[0].removeAttribute('aria-expanded');
            element.fabButton[0].focus();
        } else {
            Util.addClass(element.element, element.visibleClass);
            element.fabButton[0].setAttribute('aria-expanded', 'true');
        }

        // wait for the end of the transition
        element.fabPopover[0].addEventListener('transitionend', function cb() {
            element.animating = false;
            element.fabPopover[0].removeEventListener('transitionend', cb);
            if (!isOpen) focusPopover(element);
        });
    };

    function focusPopover(element) {
        getFocusableElements(element);
        if (element.firstFocusable) {
            element.firstFocusable.focus();
        }
    };

    // trapping focus
    function getFocusableElements(element) {
        // get all focusable elements inside the popover
        var allFocusable = element.fabPopover[0].querySelectorAll(focusableElString);
        getFirstVisible(element, allFocusable);
        getLastVisible(element, allFocusable);
    };

    function getFirstVisible(element, focusableElments) {
        // get first visible focusable element inside the popover
        for (var i = 0; i < focusableElments.length; i++) {
            if (isVisible(focusableElments[i])) {
                element.firstFocusable = focusableElments[i];
                break;
            }
        }
    };

    function getLastVisible(element, focusableElments) {
        // get last visible focusable element inside the popover
        for (var i = focusableElments.length - 1; i >= 0; i--) {
            if (isVisible(focusableElments[i])) {
                element.lastFocusable = focusableElments[i];
                break;
            }
        }
    };

    function trapFocus(element, event) {
        if (element.firstFocusable == document.activeElement && event.shiftKey) {
            //on Shift+Tab -> focus last focusable element when focus moves out of popover
            event.preventDefault();
            element.lastFocusable.focus();
        }
        if (element.lastFocusable == document.activeElement && !event.shiftKey) {
            //on Tab -> focus first focusable element when focus moves out of popover
            event.preventDefault();
            element.firstFocusable.focus();
        }
    };

    function isVisible(element) {
        // check if element is visible
        return element.offsetWidth || element.offsetHeight || element.getClientRects().length;
    };

    // offset functions 
    function resetFabVisibility(element) {
        getFabBtnOffsets(element); // get offset values - show/hide fab button 
        var scrollTop = document.documentElement.scrollTop,
            topTarget = false,
            bottomTarget = false;
        if (element.offsetIn <= scrollTop || element.offsetIn == 0) {
            topTarget = true;
        }
        if (element.offsetOut == 0 || scrollTop < element.offsetOut) {
            bottomTarget = true;
        }
        Util.toggleClass(element.element, 'fab--in', bottomTarget && topTarget);

        // if popover is visible -> close it
        if ((!bottomTarget || !topTarget) && Util.hasClass(element.element, element.visibleClass)) toggleFab(element);
    };

    function getFabBtnOffsets(element) { // get offset in and offset out values
        // update offsetIn
        element.offsetIn = 0;
        if (element.targetIn) {
            var boundingClientRect = element.targetIn.getBoundingClientRect();
            element.offsetIn = boundingClientRect.top + document.documentElement.scrollTop + boundingClientRect.height;
        }
        var dataOffsetIn = element.element.getAttribute('data-offset-in');
        if (dataOffsetIn) {
            element.offsetIn = element.offsetIn + parseInt(dataOffsetIn);
        }
        // update offsetOut
        element.offsetOut = 0;
        if (element.targetOut) {
            var boundingClientRect = element.targetOut.getBoundingClientRect();
            element.offsetOut = boundingClientRect.top + document.documentElement.scrollTop - window.innerHeight;
        }
        var dataOffsetOut = element.element.getAttribute('data-offset-out');
        if (dataOffsetOut) {
            element.offsetOut = element.offsetOut + parseInt(dataOffsetOut);
        }
    };

    //initialize the Fab objects
    var fabs = document.getElementsByClassName('js-fab');
    // generic focusable elements string selector
    var focusableElString = '[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), iframe, object, embed, [tabindex]:not([tabindex="-1"]), [contenteditable], audio[controls], video[controls], summary';
    if (fabs.length > 0) {
        var fabsArray = [];
        for (var i = 0; i < fabs.length; i++) {
            (function (i) { fabsArray.push(new Fab(fabs[i])); })(i);
        }

        // reset fab height on resize
        var resizingId = false;

        window.addEventListener('resize', function () {
            clearTimeout(resizingId);
            resizingId = setTimeout(doneResizing);
        });

        window.addEventListener('scroll', function () {
            clearTimeout(resizingId);
            resizingId = setTimeout(doneScrolling);
        });

        function doneResizing() {
            fabsArray.forEach(function (element) {
                element.setVariables();
                element.resetVisibility();
            });
        };

        function doneScrolling() {
            fabsArray.forEach(function (element) {
                element.resetVisibility();
            });
        };
    }
}());