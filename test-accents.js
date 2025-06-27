// Test de la fonction de suppression d'accents

function removeAccents(text) {
    return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

// Tests
const testCases = [
    "C'est qui Jennifer ?",
    "Tu parles de Jenny ? Ma collègue ?",
    "Bonjour, comment ça va ?",
    "J'ai mangé des crêpes à Noël",
    "Élève français très étudieux",
    "Café, thé, récré, déjà",
    "Naïf et coûteux"
];

console.log("=== Test de suppression d'accents ===");
testCases.forEach(test => {
    const result = removeAccents(test);
    console.log(`Original: "${test}"`);
    console.log(`Sans accents: "${result}"`);
    console.log('---');
});
