/** This file is for custom object prototype functions/overrides */

Object.getPrototypeOf(Array).isEqual = arrayIsEqual;
// one export needed to test
export function arrayIsEqual(array1,array2){
    if(!Array.isArray(array1) && Array.isArray(array2)) return false;
    return JSON.stringify(array1) === JSON.stringify(array2);
}

Object.getPrototypeOf(Object).isObject = function isObject(object) {
    return object != null && typeof object === 'object';
}

//compare objects(can be nested)
Object.getPrototypeOf(Object).compareValues = function(object1,object2,useTripleEqual = false){
    if(!object1 || !object2)
        return false;
    const keys1 = Object.keys(object1);
    const keys2 = Object.keys(object2);

    if (numberOfKeysDiffers(keys1,keys2)) return false;

    for (const key of keys1) {
        const val1 = object1[key];
        const val2 = object2[key];

        if(allValuesAreNotEqual(val1,val2,useTripleEqual)) return false;
    }
    return true;
}

function allValuesAreNotEqual(val1,val2,useTripleEqual){
    return (nestedObjectsAreNotEqual(val1,val2,useTripleEqual) ||
           bothValuesAreNotObjectsAndUnequal(val1,val2,useTripleEqual) ||
           arraysAreNotEqual(val1,val2));
}

function numberOfKeysDiffers(keys1,keys2){
    return keys1.length !== keys2.length;
}

// if objects not equal, returns object of differing keys and values
Object.getPrototypeOf(Object).diff = function(object1,object2,useTripleEqual = false){
    if(Object.compareValues(object1,object2,useTripleEqual)) return false;

    const keys2 = Object.keys(object2);
    const diff = {};

    for(const object2key of keys2){
        const val1 = object1[object2key];
        const val2 = object2[object2key];
        checkKey({
            diff,
            val1,
            val2,
            useTripleEqual,
            object2key
        });
    }
    return diff;
}

function checkKey(testObject){

    if (bothValuesAreNotObjectsAndUnequal(testObject.val1,testObject.val2,testObject.useTripleEqual)||
        arraysAreNotEqual(testObject.val1,testObject.val2)) {
        addPropertyToDiff(testObject.diff,testObject.object2key,testObject.val2);
    }

    testNestedObjects(testObject.val1,testObject.val2,testObject.useTripleEqual)

}

function testNestedObjects(diff,obj1,obj2,useTripleEqual){
    if(!nestedObjectsAreNotEqual(obj1,obj2,useTripleEqual)) return false;
    addPropertyToDiff(diff,object2key,Object.diff(obj1,obj2,useTripleEqual));
}

function bothValuesAreNotObjectsAndUnequal(val1,val2,useTripleEqual){
    if(!areBothValuesObjects()) return false;
    return useTripleEqual? val1 !== val2 : val1 != val2;

}

function areBothValuesObjects(val1,val2){
    //if(Array.isArray(val1) || Array.isArray(val2)) return false;
    return Object.isObject(val1) && Object.isObject(val2);
}

function nestedObjectsAreNotEqual(obj1,obj2,useTripleEqual){
    if(!areBothValuesObjects(obj1,obj2)) return false;
    return !Object.compareValues(obj1, obj2, useTripleEqual);
}

function addPropertyToDiff(diff,property,value){
    diff[property] = value;
}

function object1DoesNotContainObject2Key(object1,object2key){
    return !object1[object2key]
}

function arraysAreNotEqual(array1,array2){
    return !Array.isEqual(array1,array2);
}
