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

// ------------------------------------------------------------
// MAGNITUDE (LENGTH) OF A VECTOR
// ------------------------------------------------------------
const magnitude = (vector) => {
    let sumOfSquares = 0;

    for (let i = 0; i < vector.length; i += 1) {
        sumOfSquares += vector[i] * vector[i];
    }

    return Math.sqrt(sumOfSquares);
};