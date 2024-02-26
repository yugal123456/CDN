export async function generateWorkers(string,arrays,arrayOfObjectKeys){
    const workerPath = '/public/js/global/workers/arrayFilter.worker.js?v=REPLACED_BY_SCRIPT';
    let workerArray = [];
    let returnArray = [];

    for(let i=0;i<arrays.length;i++){
        workerArray[i] = new Worker(workerPath);
        workerArray[i].onmessage = (e)=>{returnArray.push(e.data)};
        workerArray[i].postMessage([string,arrays[i],arrayOfObjectKeys]);
    }

    await delay(500);

    let tArray = [];
    for(let i = 0; i < returnArray.length; i++){
        tArray = tArray.concat(returnArray[i]);
    }

    return tArray;
}
