// Test pour vérifier que seuls les accents du nom de fichier sont supprimés

function removeAccents(text) {
    return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

// Simulation d'un nom de fichier avec accents
const hookWithAccents = "Café avec des crêpes à Noël";
const cleanHook = removeAccents(hookWithAccents)
    .replace(/[^\w\s-]/g, '') // Remove special characters except spaces and hyphens
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .substring(0, 50); // Limit length

console.log("=== Test nom de fichier ===");
console.log(`Hook original: "${hookWithAccents}"`);
console.log(`Nom de fichier nettoyé: "${cleanHook}"`);
console.log("");

// Simulation d'une conversation qui GARDE ses accents
const conversation = {
    hook: "Café avec des crêpes à Noël",
    botName: "Amélie",
    userPseudo: "François",
    messages: [
        { sender: "user", text: "Salut ! Tu veux aller au café ?" },
        { sender: "bot", text: "Oui, avec plaisir ! J'adore les crêpes là-bas !" },
        { sender: "user", text: "Parfait ! À tout à l'heure près de l'église !" }
    ]
};

console.log("=== Conversation (GARDE ses accents) ===");
console.log(JSON.stringify(conversation, null, 2));
