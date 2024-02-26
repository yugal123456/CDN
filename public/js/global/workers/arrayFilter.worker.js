function searchObjectArray(string,objectArray,arrayOfObjectKeys){
    let tempData = [];
    string = string.toLowerCase();
    for(const obj of objectArray){
        let flag = false;
        for(const value of arrayOfObjectKeys){
            flag = (obj[value] + []).toLowerCase().includes(string);
            if(tempData.includes(obj))
                continue;
            if(flag){
                tempData.push(obj);
            }
        };
    };
   // console.log(tempData);
    return tempData;
}

onmessage = (e) =>{
    let string = e.data[0]
    let objectArray = e.data[1]
    let arrayOfObjectKeys = e.data[2]
    res = searchObjectArray(string,objectArray,arrayOfObjectKeys);
    postMessage(res);
    close();
}
