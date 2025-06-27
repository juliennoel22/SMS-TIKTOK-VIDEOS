// Global variables
let messages = [
    { sender: "user", text: "C'est qui Jennifer ?" },
    { sender: "bot", text: "Tu parles de Jenny ? Ma collègue ?" }
];

let messageCounter = 0;

// Templates de conversations
const conversationTemplates = [
    {
        name: "Jalousie - Collègue",
        botName: "Tom",
        gender: "male",
        hook: "POV : Il m'a dit que c'était juste une collègue...",
        CTA: "Je fais quoi ?\nAidez moi !",
        messages: [
            { sender: "user", text: "C'est qui Jennifer ?" },
            { sender: "bot", text: "Tu parles de Jenny ? Ma collègue ?" },
            { sender: "user", text: "Ah ouais, une collègue…" },
            { sender: "bot", text: "Bah ouais\nPourquoi ?" },
            { sender: "user", text: "Donc c'est JUSTE une collègue ?" },
            { sender: "bot", text: "Att, t'es jalouse ?" }
        ]
    },
    {
        name: "Mensonge - Sortie",
        botName: "Alex",
        gender: "male",
        hook: "POV : Il ment sur où il était hier soir...",
        CTA: "Vous auriez fait quoi ?",
        messages: [
            { sender: "user", text: "Tu étais où hier ?" },
            { sender: "bot", text: "Chez moi pourquoi ?" },
            { sender: "user", text: "T'es sûr ?" },
            { sender: "bot", text: "Oui bah évidemment" },
            { sender: "user", text: "Alors pourquoi Sarah t'a vu en ville ?" },
            { sender: "bot", text: "..." }
        ]
    },
    {
        name: "Trahison - Meilleure amie",
        botName: "Emma",
        gender: "female",
        hook: "POV : Ma meilleure amie sort avec mon ex...",
        CTA: "Team Emma ou team moi ?",
        messages: [
            { sender: "user", text: "J'ai vu tes stories avec Lucas" },
            { sender: "bot", text: "Et alors ?" },
            { sender: "user", text: "C'est mon ex Emma..." },
            { sender: "bot", text: "Plus maintenant non ?" },
            { sender: "user", text: "T'es sérieuse là ?" },
            { sender: "bot", text: "Il est libre maintenant 🤷‍♀️" }
        ]
    }
];

// Notification system
function showNotification(message, type = 'info') {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.className = `notification ${type} show`;

    setTimeout(() => {
        notification.classList.remove('show');
    }, 4000);
}

// Check AI availability on page load
async function checkAIAvailability() {
    try {
        const response = await fetch('/api/ai-status');
        const status = await response.json();

        if (!status.available) {
            // Disable AI generation and show warning
            const aiCards = document.querySelectorAll('[onclick="openAIModal()"]');
            aiCards.forEach(card => {
                card.style.opacity = '0.5';
                card.style.cursor = 'not-allowed';
                card.onclick = () => {
                    showNotification('IA non disponible. Vérifiez votre clé API OpenAI dans le fichier .env', 'error');
                };
            });

            const aiButton = document.querySelector('button[onclick*="generateWithAI"]');
            if (aiButton) {
                aiButton.disabled = true;
                aiButton.innerHTML = '<i class="fas fa-exclamation-triangle mr-2"></i>IA non disponible';
            }

            console.warn('⚠️ IA non disponible - clé API manquante');
        } else {
            console.log('✅ IA disponible');
        }
    } catch (error) {
        console.error('Erreur lors de la vérification du statut IA:', error);
    }
}

// Initialize page
document.addEventListener('DOMContentLoaded', function () {
    loadMessages();
    checkAIAvailability();
});

// Message management
function addMessage() {
    messageCounter++;
    const container = document.getElementById('messagesContainer');
    const messageDiv = document.createElement('div');
    messageDiv.className = 'flex items-start space-x-4 p-4 border border-gray-200 rounded-lg';
    messageDiv.id = `message-${messageCounter}`;

    messageDiv.innerHTML = `
        <div class="flex-shrink-0">
            <div class="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <i class="fas fa-comment text-blue-600"></i>
            </div>
        </div>
        <div class="flex-grow">
            <div class="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                <div>
                    <select class="sender-select w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                        <option value="user">Utilisateur</option>
                        <option value="bot">Contact</option>
                    </select>
                </div>
                <div class="md:col-span-2">
                    <textarea class="message-text w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none" 
                              rows="2" 
                              placeholder="Tapez votre message..."></textarea>
                </div>
                <div class="flex space-x-2">
                    <button onclick="moveMessageUp(${messageCounter})" class="btn-secondary">
                        <i class="fas fa-arrow-up"></i>
                    </button>
                    <button onclick="moveMessageDown(${messageCounter})" class="btn-secondary">
                        <i class="fas fa-arrow-down"></i>
                    </button>
                    <button onclick="removeMessage(${messageCounter})" class="btn-danger">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        </div>
    `;

    container.appendChild(messageDiv);

    // Add event listeners
    const textarea = messageDiv.querySelector('.message-text');
    const select = messageDiv.querySelector('.sender-select');

    textarea.addEventListener('input', function () {
        // No preview update needed
    });
    select.addEventListener('change', function () {
        // No preview update needed
    });
}

function removeMessage(id) {
    const messageDiv = document.getElementById(`message-${id}`);
    if (messageDiv) {
        messageDiv.remove();
        showNotification('Message supprimé', 'info');
    }
}

function moveMessageUp(id) {
    const messageDiv = document.getElementById(`message-${id}`);
    const prevSibling = messageDiv.previousElementSibling;

    if (prevSibling) {
        messageDiv.parentNode.insertBefore(messageDiv, prevSibling);
        showNotification('Message déplacé vers le haut', 'info');
    }
}

function moveMessageDown(id) {
    const messageDiv = document.getElementById(`message-${id}`);
    const nextSibling = messageDiv.nextElementSibling;

    if (nextSibling) {
        messageDiv.parentNode.insertBefore(nextSibling, messageDiv);
        showNotification('Message déplacé vers le bas', 'info');
    }
}

function loadMessages() {
    const container = document.getElementById('messagesContainer');
    container.innerHTML = '';

    messages.forEach((msg, index) => {
        messageCounter++;
        const messageDiv = document.createElement('div');
        messageDiv.className = 'flex items-start space-x-4 p-4 border border-gray-200 rounded-lg';
        messageDiv.id = `message-${messageCounter}`;

        messageDiv.innerHTML = `
            <div class="flex-shrink-0">
                <div class="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <i class="fas fa-comment text-blue-600"></i>
                </div>
            </div>
            <div class="flex-grow">
                <div class="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                    <div>
                        <select class="sender-select w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                            <option value="user" ${msg.sender === 'user' ? 'selected' : ''}>Utilisateur</option>
                            <option value="bot" ${msg.sender === 'bot' ? 'selected' : ''}>Contact</option>
                        </select>
                    </div>
                    <div class="md:col-span-2">
                        <textarea class="message-text w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none" 
                                  rows="2" 
                                  placeholder="Tapez votre message...">${msg.text}</textarea>
                    </div>
                    <div class="flex space-x-2">
                        <button onclick="moveMessageUp(${messageCounter})" class="btn-secondary">
                            <i class="fas fa-arrow-up"></i>
                        </button>
                        <button onclick="moveMessageDown(${messageCounter})" class="btn-secondary">
                            <i class="fas fa-arrow-down"></i>
                        </button>
                        <button onclick="removeMessage(${messageCounter})" class="btn-danger">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;

        container.appendChild(messageDiv);

        // Add event listeners
        const textarea = messageDiv.querySelector('.message-text');
        const select = messageDiv.querySelector('.sender-select');

        textarea.addEventListener('input', function () {
            // No preview update needed
        });
        select.addEventListener('change', function () {
            // No preview update needed
        });
    });
}

// Preview management
// Conversation management
function getConversationData() {
    const botName = document.getElementById('botName').value;
    const botGender = document.getElementById('botGender').value;
    const hook = document.getElementById('hook').value;
    const cta = document.getElementById('cta').value;

    // Get messages from form
    const messages = [];
    const messageElements = document.querySelectorAll('#messagesContainer > div');

    messageElements.forEach(element => {
        const sender = element.querySelector('.sender-select').value;
        const text = element.querySelector('.message-text').value.trim();

        if (text) {
            messages.push({ sender, text });
        }
    });

    return {
        botName: botName || 'Contact',
        gender: botGender,
        hook: hook || 'POV : Une conversation intéressante...',
        CTA: cta || 'Que pensez-vous ?',
        messages: messages
    };
}

async function saveAndConfigure() {
    const button = event.target;
    const loading = button.querySelector('.loading');
    const span = button.querySelector('span');

    if (loading) loading.classList.add('show');
    button.disabled = true;

    try {
        const conversationData = getConversationData();

        if (conversationData.messages.length === 0) {
            throw new Error('Ajoutez au moins un message à la conversation');
        }

        // Get video settings
        const videoSettings = {
            darkTheme: document.getElementById('darkTheme').value === 'true',
            messageDuration: parseInt(document.getElementById('messageDuration').value),
            initialDelay: parseInt(document.getElementById('initialDelay').value),
            showTypingInputBar: document.getElementById('showTypingBar').checked,
            enableAudioGeneration: document.getElementById('enableAudio').checked
        };

        // Save conversation and update code
        const response = await fetch('/api/save-and-configure', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                conversation: conversationData,
                settings: videoSettings
            })
        });

        const result = await response.json();

        if (result.success) {
            showNotification('Configuration sauvegardée avec succès !', 'success');
            showConfigurationInstructions(result.filename);
        } else {
            throw new Error(result.error || 'Erreur lors de la sauvegarde');
        }

    } catch (error) {
        showNotification(`Erreur: ${error.message}`, 'error');
    } finally {
        if (loading) loading.classList.remove('show');
        button.disabled = false;
    }
}

async function openRemotionStudio() {
    const button = event.target;
    const loading = button.querySelector('.loading');
    const span = button.querySelector('span');

    if (loading) loading.classList.add('show');
    button.disabled = true;

    try {
        // Start Remotion Studio
        const response = await fetch('/api/start-remotion', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        const result = await response.json();

        if (result.success) {
            showNotification('Remotion Studio démarré !', 'success');

            // Open Remotion Studio in new tab after a short delay
            setTimeout(() => {
                window.open('http://localhost:3000', '_blank');
            }, 2000);

            showRemotionInstructions();
        } else {
            throw new Error(result.error || 'Erreur lors du démarrage');
        }

    } catch (error) {
        showNotification(`Erreur: ${error.message}`, 'error');
    } finally {
        if (loading) loading.classList.remove('show');
        button.disabled = false;
    }
}

function showConfigurationInstructions(filename) {
    const instructions = `
✅ Configuration appliquée avec succès !

📁 Fichier créé : ${filename}
🔧 Paramètres vidéo mis à jour dans src/Sms.tsx
🎬 Prêt pour Remotion Studio

➡️ Étape suivante : Cliquez sur "Ouvrir Remotion Studio" pour prévisualiser et rendre votre vidéo.
    `;

    console.log(instructions);
}

function showRemotionInstructions() {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
    modal.innerHTML = `
        <div class="bg-white rounded-lg p-8 max-w-2xl mx-4">
            <div class="text-center">
                <div class="mb-4">
                    <i class="fas fa-video text-6xl text-blue-600"></i>
                </div>
                <h3 class="text-2xl font-bold mb-4 text-gray-800">Remotion Studio</h3>
                <div class="text-left space-y-3 mb-6">
                    <p class="flex items-center"><i class="fas fa-check text-green-500 mr-2"></i> Configuration appliquée</p>
                    <p class="flex items-center"><i class="fas fa-external-link-alt text-blue-500 mr-2"></i> Studio ouvert dans un nouvel onglet</p>
                    <p class="flex items-center"><i class="fas fa-play text-purple-500 mr-2"></i> Prévisualisez votre vidéo</p>
                    <p class="flex items-center"><i class="fas fa-download text-orange-500 mr-2"></i> Rendez en MP4 quand prêt</p>
                </div>
                <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                    <p class="text-sm text-yellow-800">
                        <i class="fas fa-info-circle mr-2"></i>
                        <strong>Pour l'audio :</strong> Utilisez <code>npm run gen-audio</code> dans le terminal avant le rendu final.
                    </p>
                </div>
                <button onclick="this.parentElement.parentElement.remove()" class="btn-primary">
                    <i class="fas fa-check mr-2"></i>
                    Compris !
                </button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    // Auto-remove after 10 seconds
    setTimeout(() => {
        if (document.body.contains(modal)) {
            document.body.removeChild(modal);
        }
    }, 10000);
}

async function generateWithAI() {
    const button = event.target;
    const loading = button.querySelector('.loading');
    const span = button.querySelector('span');

    if (loading) loading.classList.add('show');
    button.disabled = true;

    try {
        const topic = document.getElementById('aiTopic')?.value?.trim() || 'conversation générale';

        // Call the real OpenAI API via our server
        const response = await fetch('/api/generate-ai', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                prompt: `Créez une conversation sur le thème: ${topic}`,
                tone: 'drama',
                length: 'medium'
            })
        });

        const result = await response.json();

        if (!result.success) {
            throw new Error(result.error || 'Erreur lors de la génération IA');
        }

        const generatedConversation = result.conversation;

        // Fill form with generated data
        document.getElementById('botName').value = generatedConversation.botName;
        document.getElementById('botGender').value = generatedConversation.gender;
        document.getElementById('hook').value = generatedConversation.hook;
        document.getElementById('cta').value = generatedConversation.CTA;

        // Clear existing messages and load new ones
        messages = generatedConversation.messages;
        loadMessages();

        showNotification('Conversation générée par IA avec succès !', 'success');

    } catch (error) {
        showNotification(`Erreur: ${error.message}`, 'error');
    } finally {
        if (loading) loading.classList.remove('show');
        button.disabled = false;
    }
}

function generateRandomConversation(topic) {
    const names = ['Alex', 'Sarah', 'Tom', 'Emma', 'Lucas', 'Chloé', 'Maxime', 'Léa'];
    const randomName = names[Math.floor(Math.random() * names.length)];
    const randomGender = Math.random() > 0.5 ? 'male' : 'female';

    // Simple AI-like generation based on topic
    const topicTemplates = {
        'jalousie': {
            hook: `POV : ${randomName} est jaloux/jalouse...`,
            messages: [
                { sender: "user", text: "Tu étais avec qui hier ?" },
                { sender: "bot", text: "Avec des amis pourquoi ?" },
                { sender: "user", text: "Des amis... lesquels ?" },
                { sender: "bot", text: "Tu me fais une crise de jalousie là ?" }
            ]
        },
        'mensonge': {
            hook: `POV : ${randomName} me ment en face...`,
            messages: [
                { sender: "user", text: "Tu m'as dit que tu travaillais" },
                { sender: "bot", text: "Oui et alors ?" },
                { sender: "user", text: "Je t'ai vu au ciné avec quelqu'un" },
                { sender: "bot", text: "..." }
            ]
        },
        'trahison': {
            hook: `POV : ${randomName} me trahit...`,
            messages: [
                { sender: "user", text: "J'ai appris pour toi et mon ex" },
                { sender: "bot", text: "On peut en parler ?" },
                { sender: "user", text: "NON on peut pas en parler" },
                { sender: "bot", text: "C'est pas ce que tu crois..." }
            ]
        }
    };

    const template = topicTemplates[topic.toLowerCase()] || topicTemplates['jalousie'];

    return {
        botName: randomName,
        gender: randomGender,
        hook: template.hook,
        CTA: "Vous en pensez quoi ?\nDites-moi en commentaire !",
        messages: template.messages
    };
}

// Template management
function loadTemplate(templateIndex) {
    const template = conversationTemplates[templateIndex];

    if (template) {
        document.getElementById('botName').value = template.botName;
        document.getElementById('botGender').value = template.gender;
        document.getElementById('hook').value = template.hook;
        document.getElementById('cta').value = template.CTA;

        messages = [...template.messages];
        loadMessages();

        showNotification(`Template "${template.name}" chargé !`, 'success');
    }
}

// Event listeners for real-time updates
document.addEventListener('DOMContentLoaded', function () {
    // Add event listeners for real-time updates (removing preview functionality)
    const inputs = ['botName', 'botGender', 'hook', 'cta'];
    inputs.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            // No longer need preview update listeners
        }
    });

    // Add essential shortcuts only
    document.addEventListener('keydown', function (e) {
        // Ctrl+S to save and configure
        if (e.ctrlKey && e.key === 's') {
            e.preventDefault();
            saveAndConfigure();
        }

        // Escape to close modals
        if (e.key === 'Escape') {
            closeImportModal();
            closeAIModal();
        }
    });

    // Close modals when clicking outside
    document.getElementById('importModal').addEventListener('click', function (e) {
        if (e.target === this) {
            closeImportModal();
        }
    });

    document.getElementById('aiModal').addEventListener('click', function (e) {
        if (e.target === this) {
            closeAIModal();
        }
    });
});

// Utility functions
function downloadJSON(data, filename) {
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Quick actions
function quickAction(action) {
    switch (action) {
        case 'clear':
            if (confirm('Effacer toute la conversation ?')) {
                document.getElementById('messagesContainer').innerHTML = '';
                messageCounter = 0;
                showNotification('Conversation effacée', 'info');
            }
            break;

        case 'duplicate':
            const conversationData = getConversationData();
            const timestamp = new Date().getTime();
            downloadJSON(conversationData, `conversation-copy-${timestamp}.json`);
            showNotification('Copie de la conversation téléchargée', 'success');
            break;

        case 'random':
            const randomTemplate = conversationTemplates[Math.floor(Math.random() * conversationTemplates.length)];
            loadTemplate(conversationTemplates.indexOf(randomTemplate));
            break;
    }
}

// Modal management functions
function openImportModal() {
    document.getElementById('importModal').style.display = 'flex';
    document.getElementById('jsonInput').focus();
}

function closeImportModal() {
    document.getElementById('importModal').style.display = 'none';
    document.getElementById('jsonInput').value = '';
}

function openAIModal() {
    document.getElementById('aiModal').style.display = 'flex';
    document.getElementById('aiPrompt').focus();
}

function closeAIModal() {
    document.getElementById('aiModal').style.display = 'none';
    document.getElementById('aiPrompt').value = '';
}

function createFromScratch() {
    // Clear everything and start fresh
    if (confirm('Créer une nouvelle conversation de zéro ? Cela effacera la conversation actuelle.')) {
        // Reset form
        document.getElementById('botName').value = '';
        document.getElementById('botGender').value = 'male';
        document.getElementById('hook').value = '';
        document.getElementById('cta').value = '';

        // Clear messages
        messages = [];
        document.getElementById('messagesContainer').innerHTML = '';
        messageCounter = 0;

        // Add initial message
        addMessage();

        showNotification('Nouvelle conversation créée ! Configurez vos paramètres.', 'success');

        // Scroll to configuration section
        document.querySelector('.form-section').scrollIntoView({ behavior: 'smooth' });
    }
}

function validateAndImportJSON() {
    const jsonText = document.getElementById('jsonInput').value.trim();

    if (!jsonText) {
        showNotification('Veuillez coller un script JSON', 'error');
        return;
    }

    try {
        const data = JSON.parse(jsonText);

        // Validate required fields
        if (!data.messages || !Array.isArray(data.messages)) {
            throw new Error('Le JSON doit contenir un tableau "messages"');
        }

        if (data.messages.length === 0) {
            throw new Error('La conversation doit contenir au moins un message');
        }

        // Validate message format
        for (let i = 0; i < data.messages.length; i++) {
            const msg = data.messages[i];
            if (!msg.sender || !msg.text) {
                throw new Error(`Message ${i + 1}: "sender" et "text" sont requis`);
            }
            if (msg.sender !== 'user' && msg.sender !== 'bot') {
                throw new Error(`Message ${i + 1}: "sender" doit être "user" ou "bot"`);
            }
        }

        // Import the data
        document.getElementById('botName').value = data.botName || 'Contact';
        document.getElementById('botGender').value = data.gender || 'male';
        document.getElementById('hook').value = data.hook || '';
        document.getElementById('cta').value = data.CTA || '';

        // Load messages
        messages = data.messages;
        loadMessages();

        closeImportModal();
        showNotification('Script JSON importé avec succès !', 'success');

        // Scroll to messages section
        document.querySelector('#messagesContainer').scrollIntoView({ behavior: 'smooth' });

        // Auto-save to update Remotion (if enabled)
        if (document.getElementById('autoSave')?.checked) {
            setTimeout(() => {
                autoSaveAndConfigure('Import JSON terminé');
            }, 1000);
        }

    } catch (error) {
        showNotification(`Erreur JSON : ${error.message}`, 'error');
    }
}

// Enhanced AI generation with modal data
async function generateWithAIFromModal() {
    const button = event.target;
    const loading = button.querySelector('.loading');
    const span = button.querySelector('span');

    if (loading) loading.classList.add('show');
    button.disabled = true;

    try {
        const prompt = document.getElementById('aiPrompt').value.trim();
        const tone = document.getElementById('aiTone').value;
        const length = document.getElementById('aiLength').value;

        if (!prompt) {
            throw new Error('Décrivez votre idée pour la génération IA');
        }

        // Call the real OpenAI API via our server
        console.log('🤖 Appel de l\'API OpenAI...');
        const response = await fetch('/api/generate-ai', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                prompt: prompt,
                tone: tone,
                length: length
            })
        });

        const result = await response.json();

        if (!result.success) {
            throw new Error(result.error || 'Erreur lors de la génération IA');
        }

        const generatedConversation = result.conversation;

        // Fill form with generated data
        document.getElementById('botName').value = generatedConversation.botName;
        document.getElementById('botGender').value = generatedConversation.gender;
        document.getElementById('hook').value = generatedConversation.hook;
        document.getElementById('cta').value = generatedConversation.CTA;

        // Clear existing messages and load new ones
        messages = generatedConversation.messages;
        loadMessages();

        closeAIModal();

        let successMessage = 'Conversation générée par IA avec succès !';
        if (result.fallback) {
            successMessage += ' (Mode de secours utilisé)';
        }
        showNotification(successMessage, 'success');

        // Scroll to messages section
        document.querySelector('#messagesContainer').scrollIntoView({ behavior: 'smooth' });

        // Auto-save to update Remotion (if enabled)
        if (document.getElementById('autoSave')?.checked) {
            setTimeout(() => {
                autoSaveAndConfigure('Génération IA terminée');
            }, 1000);
        }

    } catch (error) {
        console.error('Erreur génération IA:', error);
        showNotification(`Erreur: ${error.message}`, 'error');
    } finally {
        if (loading) loading.classList.remove('show');
        button.disabled = false;
    }
}

function generateAdvancedConversation(prompt, tone, length) {
    const names = ['Alex', 'Sarah', 'Tom', 'Emma', 'Lucas', 'Chloé', 'Maxime', 'Léa', 'Nathan', 'Manon'];
    const randomName = names[Math.floor(Math.random() * names.length)];
    const randomGender = Math.random() > 0.5 ? 'male' : 'female';

    // Message count based on length
    const messageCounts = {
        'short': 4 + Math.floor(Math.random() * 3), // 4-6
        'medium': 6 + Math.floor(Math.random() * 5), // 6-10
        'long': 10 + Math.floor(Math.random() * 6) // 10-15
    };
    const targetCount = messageCounts[length] || 6;

    // Generate conversation based on tone and prompt
    const templates = {
        'drama': {
            hook: `POV : ${randomName} me fait un drame...`,
            starters: ["Tu me déçois vraiment", "J'en ai marre de tes mensonges", "On doit parler sérieusement"],
            responses: ["Qu'est-ce qui te prend ?", "Tu dramatises encore", "Calme-toi un peu"],
            escalations: ["Tu ne comprends rien", "C'est toujours pareil avec toi", "Je suis fatigue(e) de ça"]
        },
        'jealousy': {
            hook: `POV : ${randomName} est jaloux/jalouse...`,
            starters: ["Tu étais avec qui hier ?", "C'est qui cette personne ?", "Tu me caches quelque chose"],
            responses: ["Pourquoi tu poses cette question ?", "Tu es encore en train de douter", "C'est de la jalousie maladive"],
            escalations: ["Je t'ai vu avec...", "Arrête de me mentir", "Dis-moi la vérité"]
        },
        'betrayal': {
            hook: `POV : ${randomName} me trahit...`,
            starters: ["J'ai découvert ton secret", "Tout le monde le savait sauf moi", "Tu m'as menti pendant des mois"],
            responses: ["De quoi tu parles ?", "Ce n'est pas ce que tu crois", "Laisse-moi t'expliquer"],
            escalations: ["J'ai les preuves", "Ne me prends pas pour un(e) idiot(e)", "C'est fini entre nous"]
        },
        'toxic': {
            hook: `POV : ${randomName} montre son vrai visage...`,
            starters: ["Tu ne fais jamais rien de bien", "Tes amis ne m'aiment pas", "Tu changes depuis quelque temps"],
            responses: ["Qu'est-ce que j'ai fait ?", "Tu exagères", "Mes amis n'ont rien à voir"],
            escalations: ["Tu ne me mérites pas", "Je perds mon temps avec toi", "Tu me déçois énormément"]
        },
        'suspense': {
            hook: `POV : ${randomName} cache quelque chose...`,
            starters: ["Il faut qu'on parle", "J'ai quelque chose à te dire", "Tu vas être surprise(e)"],
            responses: ["Qu'est-ce qui se passe ?", "Tu m'inquiètes", "Dis-moi maintenant"],
            escalations: ["Ce n'est pas facile à dire", "Tu vas mal le prendre", "Promets-moi de rester calme"]
        },
        'humor': {
            hook: `POV : ${randomName} me fait encore rire...`,
            starters: ["Tu as vu ce qui s'est passé ?", "J'ai encore fait une bêtise", "devine ce qui m'arrive"],
            responses: ["Qu'est-ce que tu as fait encore ?", "Oh non pas encore", "Raconte-moi tout"],
            escalations: ["C'est pire que tu penses", "Tu vas pas me croire", "J'ai honte de moi"]
        }
    };

    const template = templates[tone] || templates['drama'];
    const messages = [];

    // Start with a starter message
    messages.push({
        sender: "user",
        text: template.starters[Math.floor(Math.random() * template.starters.length)]
    });

    // Alternate responses
    let currentSender = "bot";
    for (let i = 1; i < targetCount; i++) {
        let text;
        if (i < targetCount / 2) {
            text = template.responses[Math.floor(Math.random() * template.responses.length)];
        } else {
            text = template.escalations[Math.floor(Math.random() * template.escalations.length)];
        }

        messages.push({
            sender: currentSender,
            text: text
        });

        currentSender = currentSender === "user" ? "bot" : "user";
    }

    return {
        botName: randomName,
        gender: randomGender,
        hook: template.hook,
        CTA: "Vous en pensez quoi ?\nDites-moi en commentaire !",
        messages: messages
    };
}

// Quick generate function for template buttons
function quickGenerate(topic) {
    document.getElementById('aiPrompt').value = `Créez une conversation sur le thème : ${topic}. Rendez-la engageante avec des tensions et un final qui donne envie de commenter.`;
    document.getElementById('aiTone').value = topic.includes('toxique') ? 'toxic' : 'drama';
    document.getElementById('aiLength').value = 'medium';
    openAIModal();
}

// Auto-save function for import and AI generation
async function autoSaveAndConfigure(source = 'Auto-save') {
    try {
        console.log(`🔄 ${source} - Sauvegarde automatique...`);
        
        const conversationData = getConversationData();

        if (conversationData.messages.length === 0) {
            console.warn('Aucun message à sauvegarder');
            return;
        }

        // Get video settings with defaults
        const videoSettings = {
            darkTheme: document.getElementById('darkTheme')?.value === 'true' || false,
            messageDuration: parseInt(document.getElementById('messageDuration')?.value) || 3000,
            initialDelay: parseInt(document.getElementById('initialDelay')?.value) || 2000,
            showTypingInputBar: document.getElementById('showTypingBar')?.checked || true,
            enableAudioGeneration: document.getElementById('enableAudio')?.checked || false
        };

        // Save conversation and update code
        const response = await fetch('/api/save-and-configure', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                conversation: conversationData,
                settings: videoSettings
            })
        });

        const result = await response.json();

        if (result.success) {
            showNotification(`✅ ${source} - Configuration mise à jour automatiquement !`, 'success');
            console.log(`✅ ${source} - Fichier créé:`, result.filename);
        } else {
            throw new Error(result.error || 'Erreur lors de la sauvegarde automatique');
        }

    } catch (error) {
        console.error(`❌ Erreur ${source}:`, error);
        showNotification(`⚠️ ${source} - Erreur de sauvegarde: ${error.message}`, 'error');
    }
}

