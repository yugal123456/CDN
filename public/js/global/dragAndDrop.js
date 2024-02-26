console.log('dragAndDrop.js loaded');

let returnPaths = [];
let returnFiles = [];
let uploadCounter = 0;

class DragAndDrop {
  constructor() {
    let fileFlag = false;

    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
      document.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
      }, false);
    });

    document.addEventListener('dragenter', (e) => {
      showModal('upload');
    }, false);

    document.addEventListener('drop', (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.handleFiles(e.dataTransfer.files);
    }, false);

    // Add event listener for file input change
    const fileInput = document.getElementById('phone-bill'); // Replace with the actual ID of your file input
    fileInput.addEventListener('change', (e) => {
      this.handleFiles(fileInput.files);
      fileInput.value = ''; // Clear the file input after handling files
    });

    console.log('dragAndDrop.js loaded2');
  }

  handleFiles(files) {
    let fileFlag = false;

    ([...files]).every(file => {
      let url = imageURLNoTiny;
      let formData = new FormData();
      formData.append('file', file);

      fetch(url, { method: 'POST', body: formData })
        .then((res) => res.json())
        .then((ress) => {
          if (ress.failure) {
            if (fileFlag) return !fileFlag;
            let str = '';
            for (const t of ress.failure)
              str += ' ' + t;
            fileFlag = true;
            notify('Please use accepted file types:' + str, 'Unacceptable File Type');
            return false;
          }
          log('Success');
          ++uploadCounter;
          returnPaths.push(ress.location);
          let name = ress.location.split('/').pop();
          returnFiles.push(name);
          this.display(name);
          makeTippy();
        })
        .catch(() => { console.log('Something went wrong...') });

      fileFlag = false;
      return true;
    });
  }

  display(name) {
    const nname = name.split('.');
    let fname = nname[0];
    let ext = nname[1];
    document.querySelector('#successfulUploads').innerText = `${uploadCounter} File(s) Uploaded Successfully: `;
    let docview = ['txt', 'csv', 'doc', 'docx', 'jpeg', 'jpg', 'png', 'pdf', 'xlsx'].includes(name.split('.')[1]) ? name.split('.')[1] : 'file';
    document.querySelector('#removeUploads').innerHTML += `<div id="a${fname}${ext}"><i data-tippy-content="Click to delete" data-name="a${name}" class="${docview}"></i>    ${name}</div>`;
  }
}

let dandd = new DragAndDrop();
