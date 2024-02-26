export default function splitArray(array, chunkSize = 10000){

    if(array.length <= chunkSize) return [array];

    const wholeChunks = Math.floor(array.length/chunkSize);
    const remainder = array.length % chunkSize;

    let from = 0;
    let to = chunkSize;
    let i = 0;

    let resArray = [];
    for(i = 0; i < wholeChunks; i++){

        const limits = getLimits(i,chunkSize);
        resArray[i] = array.slice(limits.from,limits.to);
    }

    if(0 !== remainder)
        resArray.push(array.slice((i*chunkSize), array.length));

    console.log(resArray);
    return resArray;
}

function getLimits(iteration,chunkSize){
    let from = (iteration*chunkSize);
    if(from !== 0)
        from++;
    const to = (chunkSize*(iteration+1));
    ctable({from,to});
    return {from,to};
}
