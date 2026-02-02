export function symmetricDifference(arr1, arr2) {
    if (!Array.isArray(arr1) || !Array.isArray(arr2)) {
        return [];
    }
    
    const set1 = new Set(arr1);
    const set2 = new Set(arr2);
    
    const diff1 = arr1.filter(item => !set2.has(item));
    const diff2 = arr2.filter(item => !set1.has(item));
    
    return [...diff1, ...diff2];
}