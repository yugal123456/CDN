console.log('tinymceConfig.js');
// JavaScript Document
tinymce.init({
    selector: '#mytextarea',
    branding: false,
    content_css:'/public/css/style.css',
    paste_data_images:true,
    browser_spellcheck: true,
    contextmenu: false,
    menubar: 'file edit view insert format tools table tc',
    plugins: 'preview importcss searchreplace autolink autosave save directionality visualblocks visualchars image link template codesample table charmap pagebreak nonbreaking insertdatetime advlist lists wordcount help charmap quickbars emoticons',
    toolbar: 'undo redo | codesample bold italic underline strikethrough | fontselect fontsizeselect formatselect | alignleft aligncenter alignright alignjustify | outdent indent |  numlist bullist checklist | forecolor backcolor casechange  | pagebreak | charmap | image media link codesample |',
    images_upload_url: imageURL,
    automatic_uploads: true,
    paste_as_text: true,
    // paste_preprocess: function (plugin, args){
    //     if(args.content.includes('https://www.admin')){
    //         args.content.strReplaceAll('<a>','');
    //         args.content.strReplaceAll('</a>','');
    //     }
    // },
    smart_paste: true,
    paste_data_images: true,
    block_unsupported_drop: true,
    elementpath: false,
    //toolbar: 'undo redo | styleselect | forecolor | bold italic | alignleft aligncenter alignright alignjustify | outdent indent | link image | code',
});
