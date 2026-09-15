// ------------------------------------------------------------
// DOT PRODUCT
// ------------------------------------------------------------

const dotProduct = (vectorA, vectorB) => {
    let sum = 0;

    for (let i = 0; i < vectorA.length; i += 1) {
        sum += vectorA[i] * vectorB[i];
    }

    return sum;
};