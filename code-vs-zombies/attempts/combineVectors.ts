function combineVectors(vectors, range) {
    // Create an empty array to store combined vectors
    let combinedVectors = [];

    // Iterate through each vector in the input array
    for (let i = 0; i < vectors.length; i++) {
        let currentVector = vectors[i];

        // Check if the current vector can be combined with any existing combined vector
        let combined = false;
        for (let j = 0; j < combinedVectors.length; j++) {
            let existingVector = combinedVectors[j];

            // Calculate the distance between currentVector and existingVector
            let distance = Math.sqrt(Math.pow(currentVector.x - existingVector.x, 2) + Math.pow(currentVector.y - existingVector.y, 2));

            // If distance is within the range, combine them
            if (distance <= range) {
                // Combine vectors by averaging their coordinates
                existingVector.x = (existingVector.x + currentVector.x) / 2;
                existingVector.y = (existingVector.y + currentVector.y) / 2;
                combined = true;
                break;
            }
        }

        // If currentVector couldn't be combined with any existing vector, add it as a new combined vector
        if (!combined) {
            combinedVectors.push({ x: currentVector.x, y: currentVector.y });
        }
    }

    return combinedVectors;
}

const vectors = [
    {x: 3000, y: 1000},
    {x: 4000, y: 1000},
    {x: 5000, y: 1000},
    {x: 6000, y: 1000},
    {x: 10000, y: 1000}
]

console.log(combineVectors(vectors, 4000))
