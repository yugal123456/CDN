$(document ).ready(function() {
    $('.select__input').select2();  
    $('.select__clearinput').select2({
        allowClear: true,
    }); 
    $('.select__taginput').select2({
        tags: true,
    });  
});
