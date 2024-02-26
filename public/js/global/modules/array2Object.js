// this is to be used with jQuery.serilaizeArray()
export default function array2Object(serializedArray){
    const returnObject = {};
    for(const obj of serializedArray)
        returnObject[obj.name] = obj.value;
    return returnObject;
}
