const pwsUri = 'wss://REPLACE_SOCKET:9550';

var pws = '';

const PWSInMessageTypes = {
    NewConnection: 0,
    CreateCHR: 1,
    GetCurrentWorkers: 2,
    CreateBR: 3,
    CreateLMBR: 4,
}

const PWSOutMessageTypes = {
    DownloadCHR: 0,
    SendCurrentWorkers: 1,
    WorkersDone: 2,
    DownloadBR: 3,
    DownloadLMBR: 4,
}

try{
    pws = new WebSocket(pwsUri);
}catch(e){
    console.error("Not Connected to WebSocket, please refresh page");
}

var report = '';

pws.onopen = function (e) {
    // Connection is open
    console.log("Connected To Persistent Web Socket");

    let connectionData = {
        type: PWSInMessageTypes.NewConnection,
        sessionId: getSessionId()
    }

    pws.send(JSON.stringify(connectionData));

    // Get the current workers for my session id
    let getCurrentWorkers = {
        type: PWSInMessageTypes.GetCurrentWorkers,
        sessionId: getSessionId()
    }

    pws.send(JSON.stringify(getCurrentWorkers));
}

pws.onmessage = function (e) {
    let data = JSON.parse(e['data']);

    switch(data.type){
        case PWSOutMessageTypes.DownloadCHR:
        case PWSOutMessageTypes.DownloadBR:
        case PWSOutMessageTypes.DownloadLMBR:
            handleDownload(data);
            break;
        case PWSOutMessageTypes.SendCurrentWorkers:
            handleSendCurrentWorkers(data);
            break;
        case PWSOutMessageTypes.WorkersDone:
            displayWorkerModel(false);
            break;
    }
}

pws.onerror = function (e) {
    console.log(e);
}

function handleSendCurrentWorkers(data) {
    const alertBody = document.querySelector('#currentWorkerTask');
    alertBody.innerHTML = '';

    const statusMap = {
        0: 'Pending',
        1: 'In progress',
        2: 'Completed'
    };

    let html = '';

    for (const [key, value] of Object.entries(data.workers)) {
        if (value.status === 2) continue; // skip completed workers

        html += `<h3>Creating CSV Report (${statusMap[value.workerStatus]})</h3>`;
        html += `Generating report for ${value.fullName} From: ${value.fromDateReadable} To: ${value.toDateReadable}<br>`;

        if (value.progress) {
            const progress = value.progress.toFixed(2);
            html += `
                <div class="progress-bar flex flex-column items-center js-progress-bar">
                    <p class="sr-only" aria-live="polite" aria-atomic="true">
                        Progress value is <span class="js-progress-bar__aria-value">${progress}%</span>
                    </p>

                    <span class="progress-bar__value margin-bottom-xs" aria-hidden="true">${progress}%</span>

                    <div class="progress-bar__bg" aria-hidden="true">
                        <div class="progress-bar__fill color-primary" style="width: ${progress}%;"></div>
                    </div>
                </div>
            `;
        }

        html += '<hr>';
    }

    alertBody.innerHTML = html;
    displayWorkerModel(true);
}

function handleDownload(data){
    var link = document.createElement("a");
    link.setAttribute("href", `https://REPLACE_DOWNLOAD_LINK/share/tmp/reports/${data.report}`);
    document.body.appendChild(link);
    link.click()
}

function displayWorkerModel(show){
    let modal = document.querySelector('#alert-msg-id');
    if(show === true){
        modal.setAttribute("class", "modal modal--animate-scale d-flex justify-center align-center bg-black bg-opacity-70% padding-md js-modal pointer-events-none modal--is-visible");
    }else{
        modal.setAttribute("class", "modal modal--animate-scale d-flex justify-center align-center bg-black bg-opacity-70% padding-md js-modal pointer-events-none");
    }
}
