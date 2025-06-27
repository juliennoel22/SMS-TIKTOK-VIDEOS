// Global variables
let messages = [
    { sender: "user", text: "C'est qui Jennifer ?" },
    { sender: "bot", text: "Tu parles de Jenny ? Ma collègue ?" }
];

let messageCounter = 0;

// Function to remove accents from text (used only for filename)
function removeAccents(text) {
    return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

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
    console.log('DOM loaded, initializing...');

    // Load existing conversation first
    loadExistingConversation();

    checkAIAvailability();

    // Wait a bit to ensure DOM is fully loaded
    setTimeout(() => {
        // Add event listeners for contact name and gender updates
        const botNameInput = document.getElementById('botName');
        const botGenderSelect = document.getElementById('botGender');

        console.log('Found elements:', {
            botNameInput: !!botNameInput,
            botGenderSelect: !!botGenderSelect,
            botNameValue: botNameInput?.value,
            botGenderValue: botGenderSelect?.value
        });

        if (botNameInput) {
            console.log('Adding input listener to botName');

            // Multiple event types to catch all changes
            ['input', 'change', 'keyup', 'paste'].forEach(eventType => {
                botNameInput.addEventListener(eventType, function () {
                    console.log(`botName ${eventType} event - value:`, this.value);
                    setTimeout(updateContactNameDisplay, 10);
                });
            });
        } else {
            console.error('botName element not found!');
        }

        if (botGenderSelect) {
            console.log('Adding change listener to botGender');

            ['change', 'input'].forEach(eventType => {
                botGenderSelect.addEventListener(eventType, function () {
                    console.log(`botGender ${eventType} event - value:`, this.value);
                    setTimeout(updateContactNameDisplay, 10);
                });
            });
        } else {
            console.error('botGender element not found!');
        }
    }, 100);

    // Add essential shortcuts
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
            hideAISpinner();
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

    // Close spinner when clicking outside
    document.getElementById('aiSpinner').addEventListener('click', function (e) {
        if (e.target === this) {
            hideAISpinner();
        }
    });
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
                <i class="fas fa-user"></i>
            </div>
        </div>
        <div class="flex-grow">
            <div class="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                <div>
                    <select class="sender-select w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent" onchange="updateMessageColors(${messageCounter})">
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
    updateMessageColors(messageCounter);

    // Add event listeners
    const textarea = messageDiv.querySelector('.message-text');
    const select = messageDiv.querySelector('.sender-select');

    textarea.addEventListener('input', function () {
        // No preview update needed
    });
    select.addEventListener('change', function () {
        updateMessageColors(messageCounter);
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
                    <i class="fas fa-user"></i>
                </div>
            </div>
            <div class="flex-grow">
                <div class="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                    <div>
                        <select class="sender-select w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent" onchange="updateMessageColors(${messageCounter})">
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
        updateMessageColors(messageCounter);

        // Add event listeners
        const textarea = messageDiv.querySelector('.message-text');
        const select = messageDiv.querySelector('.sender-select');

        textarea.addEventListener('input', function () {
            // No preview update needed
        });
        select.addEventListener('change', function () {
            updateMessageColors(messageCounter);
        });
    });
}

// Load existing conversation data from the main JSON file
async function loadExistingConversation() {
    try {
        const response = await fetch('/public/conversations/conversation-main.json');
        if (response.ok) {
            const data = await response.json();

            console.log('Chargement de la conversation existante:', data);

            // Load form fields
            document.getElementById('botName').value = data.botName || 'Tom';
            document.getElementById('botGender').value = data.gender || 'male';
            document.getElementById('hook').value = data.hook || '';
            document.getElementById('cta').value = data.CTA || '';

            // Load messages
            messages = data.messages || [
                { sender: "user", text: "C'est qui Jennifer ?" },
                { sender: "bot", text: "Tu parles de Jenny ? Ma collègue ?" }
            ];

            // Update display
            loadMessages();
            updateContactNameDisplay();

            console.log('Conversation existante chargée avec succès');
        } else {
            console.log('Aucune conversation existante trouvée, utilisation des valeurs par défaut');
        }
    } catch (error) {
        console.log('Erreur lors du chargement de la conversation:', error);
        console.log('Utilisation des valeurs par défaut');
    }
}

// Function to update message colors based on sender
function updateMessageColors(messageId) {
    const messageDiv = document.getElementById(`message-${messageId}`);
    if (!messageDiv) return;

    const senderSelect = messageDiv.querySelector('.sender-select');
    const sender = senderSelect.value;

    // Remove existing classes
    messageDiv.classList.remove('message-user', 'message-bot');

    // Add appropriate class based on sender
    if (sender === 'user') {
        messageDiv.classList.add('message-user');
        senderSelect.classList.add('message-sender-label');
    } else {
        messageDiv.classList.add('message-bot');
        senderSelect.classList.add('message-sender-label');
    }
}

// Update all message colors
function updateAllMessageColors() {
    const messageElements = document.querySelectorAll('#messagesContainer > div');
    messageElements.forEach(element => {
        const id = element.id.replace('message-', '');
        updateMessageColors(parseInt(id));
    });
}

// Update contact name display in interface
function updateContactNameDisplay() {
    const botName = document.getElementById('botName').value || 'Contact';
    const botGender = document.getElementById('botGender').value;

    console.log('Updating contact name display:', botName, botGender);

    // Update all bot option labels
    const botOptions = document.querySelectorAll('option[value="bot"]');
    console.log('Found', botOptions.length, 'bot options to update');

    botOptions.forEach(option => {
        option.textContent = botName;
    });

    // Force refresh of all select elements to show the new name
    const allSelects = document.querySelectorAll('.sender-select');
    allSelects.forEach(select => {
        // Store current value
        const currentValue = select.value;

        // Update the display text directly
        if (currentValue === 'bot') {
            const selectedOption = select.querySelector('option[value="bot"]');
            if (selectedOption) {
                selectedOption.textContent = botName;
                // Force a visual refresh by temporarily changing selection
                select.selectedIndex = -1;
                select.value = currentValue;

                // Trigger change event to ensure any listeners are notified
                const changeEvent = new Event('change', { bubbles: true });
                select.dispatchEvent(changeEvent);
            }
        }
    });

    // Force update of all existing message displays
    updateAllMessageColors();

    // Extra validation - log final state
    setTimeout(() => {
        const finalBotOptions = document.querySelectorAll('option[value="bot"]');
        console.log('Final bot option texts:', Array.from(finalBotOptions).map(opt => opt.textContent));
    }, 50);
}



// Preview management
// Conversation management
function getConversationData() {
    const botName = document.getElementById('botName').value;
    const botGender = document.getElementById('botGender').value;
    const hook = document.getElementById('hook').value;
    const cta = document.getElementById('cta').value;

    // Debug: log les éléments et leurs valeurs
    console.log('getConversationData debug:');
    console.log('- botName element:', document.getElementById('botName'));
    console.log('- botName value:', botName);
    console.log('- botGender element:', document.getElementById('botGender'));
    console.log('- botGender value:', botGender);

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

        console.log('botName:', conversationData.botName, 'gender:', conversationData.gender);

        if (conversationData.messages.length === 0) {
            throw new Error('Ajoutez au moins un message à la conversation');
        }

        // Get video settings
        const videoSettings = {
            darkTheme: document.getElementById('darkTheme').value === 'true',
            messageDuration: parseInt(document.getElementById('messageDuration').value),
            initialDelay: parseInt(document.getElementById('initialDelay').value),
            showTypingInputBar: document.getElementById('showTypingBar').checked,
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
            showNotification('✅ Configuration sauvegardée avec succès !', 'success');
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

// Render video function
async function renderVideo() {
    const button = event.target.closest('button');
    const loading = button?.querySelector('.loading');
    const span = button?.querySelector('span');

    if (loading) loading.classList.add('show');
    if (button) button.disabled = true;
    if (span) span.textContent = 'Rendu en cours...';

    try {
        // Get current settings
        const conversationData = getConversationData();
        if (conversationData.messages.length === 0) {
            throw new Error('Aucun message à rendre');
        }

        // Create filename from hook and date (remove accents only for filename)
        const hook = document.getElementById('hook')?.value || 'video';
        const cleanHook = removeAccents(hook) // Remove accents only for filename
            .replace(/[^\w\s-]/g, '') // Remove special characters except spaces and hyphens
            .replace(/\s+/g, '-') // Replace spaces with hyphens
            .substring(0, 50); // Limit length

        // Format date as dd-mm-yyyy
        const now = new Date();
        const day = String(now.getDate()).padStart(2, '0');
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const year = now.getFullYear();
        const dateStr = `${day}-${month}-${year}`;

        const outputName = `${cleanHook}-${dateStr}.mp4`;

        // Get video settings
        const videoSettings = {
            darkTheme: document.getElementById('darkTheme')?.value === 'true' || false,
            messageDuration: parseInt(document.getElementById('messageDuration')?.value) || 60,
            initialDelay: parseInt(document.getElementById('initialDelay')?.value) || 120,
            showTypingInputBar: document.getElementById('showTypingBar')?.checked || false,
            enableAudioGeneration: document.getElementById('enableAudio')?.checked || false
        };

        // Show progress modal
        showRenderProgressModal();

        showNotification('Démarrage du rendu vidéo...', 'info');

        // Save the original conversation (keeping accents in content)
        const response = await fetch('/api/save-and-configure', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                conversation: conversationData, // Keep original conversation with accents
                settings: videoSettings
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Erreur HTTP sauvegarde:', response.status, errorText);
            throw new Error(`Erreur lors de la sauvegarde: ${errorText}`);
        }

        const result = await response.json();
        if (!result.success) {
            throw new Error(result.error || 'Erreur lors de la sauvegarde de la conversation');
        }

        // Render the video
        const renderResponse = await fetch('/api/render-video', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                conversationFile: 'conversation-main.json',
                settings: videoSettings,
                outputName: outputName
            })
        });

        if (!renderResponse.ok) {
            const errorText = await renderResponse.text();
            console.error('Erreur HTTP rendu:', renderResponse.status, errorText);
            throw new Error(`Erreur HTTP ${renderResponse.status}: ${errorText}`);
        }

        const renderResult = await renderResponse.json();

        if (renderResult.success) {
            // Complete progress bar
            completeProgress();

            showNotification(`✅ Vidéo rendue avec succès : ${renderResult.filename}`, 'success');
            console.log('Fichier vidéo créé:', renderResult.filename);

            // Wait a moment then show success modal
            setTimeout(() => {
                hideRenderProgressModal();
                showRenderSuccessModal(renderResult.filename);
            }, 1500);
        } else {
            throw new Error(renderResult.error || 'Erreur lors du rendu');
        }

    } catch (error) {
        console.error('Erreur lors du rendu:', error);
        showNotification(`❌ Erreur de rendu: ${error.message}`, 'error');

        // Hide progress modal immediately on error
        hideRenderProgressModal();
    } finally {
        if (loading) loading.classList.remove('show');
        if (button) button.disabled = false;
        if (span) span.textContent = 'Faire le rendu';
    }
}

// Show render progress modal
function showRenderProgressModal() {
    const modal = document.createElement('div');
    modal.id = 'renderProgressModal';
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
    modal.innerHTML = `
        <div class="bg-white rounded-lg p-8 max-w-md mx-4">
            <div class="text-center">
                <div class="mb-4">
                    <i class="fas fa-video text-6xl text-red-600"></i>
                </div>
                <h3 class="text-2xl font-bold mb-4 text-gray-800">Rendu en cours...</h3>
                <div class="text-gray-600 mb-6">
                    <p class="mb-4">Génération de votre vidéo iMessage</p>
                    
                    <!-- Progress bar -->
                    <div class="w-full bg-gray-200 rounded-full h-3 mb-4">
                        <div id="progressBar" class="bg-gradient-to-r from-red-500 to-red-600 h-3 rounded-full transition-all duration-300" style="width: 0%"></div>
                    </div>
                    
                    <!-- Progress steps -->
                    <div class="text-sm text-left space-y-2">
                        <div id="step1" class="flex items-center">
                            <i class="fas fa-spinner fa-spin text-blue-500 mr-2"></i>
                            <span>Configuration des paramètres...</span>
                        </div>
                        <div id="step2" class="flex items-center text-gray-400">
                            <i class="fas fa-clock mr-2"></i>
                            <span>Rendu MP4 complet...</span>
                        </div>
                        <div id="step3" class="flex items-center text-gray-400">
                            <i class="fas fa-clock mr-2"></i>
                            <span>Découpage des 4 secondes initiales...</span>
                        </div>
                        <div id="step4" class="flex items-center text-gray-400">
                            <i class="fas fa-clock mr-2"></i>
                            <span>Finalisation...</span>
                        </div>
                    </div>
                </div>
                
                <div class="text-xs text-gray-500">
                    ⏱️ Temps estimé : 45-90 secondes
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(modal);

    // Start progress animation
    animateProgress();
}

// Hide render progress modal
function hideRenderProgressModal() {
    const modal = document.getElementById('renderProgressModal');
    if (modal) {
        document.body.removeChild(modal);
    }
}

// Animate progress bar and steps
function animateProgress() {
    const progressBar = document.getElementById('progressBar');
    const steps = ['step1', 'step2', 'step3', 'step4'];
    let currentStep = 0;
    let progress = 0;

    const interval = setInterval(() => {
        // Update progress bar
        progress += Math.random() * 5 + 2; // Random increment between 2-7%
        if (progress > 95) progress = 95; // Don't complete until render is done

        if (progressBar) {
            progressBar.style.width = progress + '%';
        }

        // Update steps
        if (progress > 25 && currentStep === 0) {
            updateStep('step1', 'step2', 'Rendu MP4 complet...');
            currentStep = 1;
        } else if (progress > 60 && currentStep === 1) {
            updateStep('step2', 'step3', 'Découpage des 4 secondes initiales...');
            currentStep = 2;
        } else if (progress > 85 && currentStep === 2) {
            updateStep('step3', 'step4', 'Finalisation...');
            currentStep = 3;
        }

        // Stop if modal is removed
        if (!document.getElementById('renderProgressModal')) {
            clearInterval(interval);
        }
    }, 800);
}

// Update step status
function updateStep(currentStepId, nextStepId, nextText) {
    const currentStep = document.getElementById(currentStepId);
    const nextStep = document.getElementById(nextStepId);

    if (currentStep) {
        currentStep.innerHTML = `
            <i class="fas fa-check text-green-500 mr-2"></i>
            <span class="text-green-600">${currentStep.querySelector('span').textContent}</span>
        `;
    }

    if (nextStep) {
        nextStep.innerHTML = `
            <i class="fas fa-spinner fa-spin text-blue-500 mr-2"></i>
            <span>${nextText}</span>
        `;
        nextStep.classList.remove('text-gray-400');
    }
}

// Complete progress animation
function completeProgress() {
    const progressBar = document.getElementById('progressBar');
    const step4 = document.getElementById('step4');

    if (progressBar) {
        progressBar.style.width = '100%';
    }

    if (step4) {
        step4.innerHTML = `
            <i class="fas fa-check text-green-500 mr-2"></i>
            <span class="text-green-600">Finalisation terminée !</span>
        `;
        step4.classList.remove('text-gray-400');
    }
}

// Show render success modal
function showRenderSuccessModal(filename) {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
    modal.innerHTML = `
        <div class="bg-white rounded-lg p-8 max-w-lg mx-4">
            <div class="text-center">
                <div class="mb-4">
                    <i class="fas fa-check-circle text-6xl text-green-600"></i>
                </div>
                <h3 class="text-2xl font-bold mb-4 text-gray-800">Rendu terminé !</h3>
                <div class="text-gray-600 mb-6">
                    <p class="mb-2">Votre vidéo a été générée avec succès :</p>
                    <p class="font-mono text-sm bg-gray-100 p-2 rounded break-all">${filename}</p>
                    <p class="mt-2 text-sm">📁 Emplacement : dossier /out/</p>
                    <p class="mt-2 text-xs text-green-600">✂️ Délai initial de 4 secondes automatiquement supprimé</p>
                </div>
                <button onclick="this.closest('.fixed').remove()" class="btn-primary">
                    <i class="fas fa-times mr-2"></i>
                    Fermer
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

// Configuration instructions display
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

// Remotion instructions display
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
                    <p class="text-gray-600"><strong>🎬 Studio ouvert !</strong> Votre navigateur va s'ouvrir sur Remotion Studio.</p>
                    <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h4 class="font-semibold text-blue-800 mb-2">Dans Remotion Studio vous pouvez :</h4>
                        <ul class="text-sm text-blue-700 list-disc list-inside space-y-1">
                            <li>Prévisualiser votre vidéo en temps réel</li>
                            <li>Ajuster les timings et paramètres</li>
                            <li>Exporter la vidéo finale en MP4</li>
                        </ul>
                    </div>
                    <div class="bg-green-50 border border-green-200 rounded-lg p-4">
                        <h4 class="font-semibold text-green-800 mb-2">💡 Astuce :</h4>
                        <p class="text-sm text-green-700">Utilisez le bouton "Faire le rendu" ici pour exporter directement sans passer par Remotion Studio.</p>
                    </div>
                </div>
                <button onclick="this.closest('.fixed').remove()" class="btn-primary">
                    <i class="fas fa-check mr-2"></i>
                    Compris !
                </button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);

    // Auto-remove after 15 seconds
    setTimeout(() => {
        if (document.body.contains(modal)) {
            document.body.removeChild(modal);
        }
    }, 15000);
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

        // Update contact name display
        updateContactNameDisplay();

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

        // Trigger change events manually to ensure listeners are fired
        const botNameEvent = new Event('change', { bubbles: true });
        const botGenderEvent = new Event('change', { bubbles: true });
        document.getElementById('botName').dispatchEvent(botNameEvent);
        document.getElementById('botGender').dispatchEvent(botGenderEvent);

        // Update contact name display
        setTimeout(() => {
            updateContactNameDisplay();
        }, 100);

        // Load messages
        messages = data.messages;
        loadMessages();

        closeImportModal();
        showNotification('Script JSON importé avec succès !', 'success');

        // Scroll to messages section
        document.querySelector('#messagesContainer').scrollIntoView({ behavior: 'smooth' });

        // Auto-save to update Remotion (always enabled now)
        setTimeout(() => {
            autoSaveAndConfigure('Import JSON terminé');
        }, 1000);

    } catch (error) {
        showNotification(`Erreur JSON : ${error.message}`, 'error');
    }
}

// Load example conversation in the modal textarea
function loadExampleInModal() {
    const exampleJSON = {
        "botName": "Tom",
        "gender": "male",
        "hook": "POV : Il m'a dit que c'était \"juste une collègue\"…",
        "CTA": "Je fais quoi ?\nAidez moi !",
        "messages": [
            {
                "sender": "user",
                "text": "C'est qui Jennifer ?"
            },
            {
                "sender": "bot",
                "text": "Tu parles de Jenny ? Ma collègue ?"
            },
            {
                "sender": "user",
                "text": "Ah ouais, une \"collègue\"…"
            },
            {
                "sender": "bot",
                "text": "Bah ouais\nPourquoi ?"
            },
            {
                "sender": "user",
                "text": "Donc c'est JUSTE une collègue ?"
            },
            {
                "sender": "bot",
                "text": "Att, t'es jalouse ?"
            },
            {
                "sender": "user",
                "text": "non\nnon"
            },
            {
                "sender": "bot",
                "text": "Tu peux me le dire si t'es jalouse hein"
            },
            {
                "sender": "user",
                "text": "jsp\nnon"
            },
            {
                "sender": "bot",
                "text": "T'es *sûre* sûre ?\nUn tout petit peu ?"
            },
            {
                "sender": "user",
                "text": "J'AI DÉJÀ DIT NON"
            },
            {
                "sender": "bot",
                "text": "Ok ok chill\nJ'aimerais te faire un bisou là"
            },
            {
                "sender": "user",
                "text": "VA DEMANDER À JENNY\nTA \"COLLÈGUE\"\nQUI LIKE TOUS TES POSTS 😐"
            }
        ]
    };

    // Format JSON with proper indentation and insert into textarea
    const formattedJSON = JSON.stringify(exampleJSON, null, 2);
    document.getElementById('jsonInput').value = formattedJSON;

    showNotification('✅ Exemple chargé !', 'success');
}

// Auto-save function (simplified version of saveAndConfigure)
async function autoSaveAndConfigure(reason = 'Auto-save') {
    try {
        const conversationData = getConversationData();

        if (conversationData.messages.length === 0) {
            console.log('Pas de messages à sauvegarder automatiquement');
            return;
        }

        // Get video settings
        const videoSettings = {
            darkTheme: document.getElementById('darkTheme').value === 'true',
            messageDuration: parseInt(document.getElementById('messageDuration').value),
            initialDelay: parseInt(document.getElementById('initialDelay').value),
            showTypingInputBar: document.getElementById('showTypingBar').checked,
            enableAudioGeneration: document.getElementById('enableAudio')?.checked || false
        };

        // Save conversation and update code silently
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
            console.log(`✅ ${reason} - Configuration sauvegardée automatiquement`);
        } else {
            console.error(`Erreur auto-save: ${result.error}`);
        }

    } catch (error) {
        console.error(`Erreur auto-save: ${error.message}`);
    }
}

// Show AI generation spinner
function showAISpinner() {
    const spinner = document.getElementById('aiSpinner');
    if (spinner) {
        spinner.classList.add('show');
    }
}

// Hide AI generation spinner
function hideAISpinner() {
    const spinner = document.getElementById('aiSpinner');
    if (spinner) {
        spinner.classList.remove('show');
    }
}

// Generate conversation with AI from modal
async function generateWithAIFromModal() {
    const button = event.target.closest('button');
    const loading = button.querySelector('.loading');
    const span = button.querySelector('span');

    // Get form values
    const prompt = document.getElementById('aiPrompt').value.trim();
    const tone = document.getElementById('aiTone')?.value || 'dramatique';
    const length = document.getElementById('aiLength')?.value || 'moyen';

    if (!prompt) {
        showNotification('Veuillez entrer une description de votre idée', 'error');
        return;
    }

    if (loading) loading.classList.add('show');
    button.disabled = true;

    try {
        // Close modal and show spinner
        closeAIModal();
        showAISpinner();

        // Call AI generation API
        const response = await fetch('/api/generate-ai', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                prompt,
                tone,
                length
            })
        });

        const result = await response.json();

        if (result.success) {
            const conversation = result.conversation;

            // Import the generated data
            document.getElementById('botName').value = conversation.botName || 'Contact';
            document.getElementById('botGender').value = conversation.gender || 'male';
            document.getElementById('hook').value = conversation.hook || '';
            document.getElementById('cta').value = conversation.CTA || '';

            // Trigger change events manually to ensure listeners are fired
            const botNameEvent = new Event('change', { bubbles: true });
            const botGenderEvent = new Event('change', { bubbles: true });
            document.getElementById('botName').dispatchEvent(botNameEvent);
            document.getElementById('botGender').dispatchEvent(botGenderEvent);

            // Update contact name display
            setTimeout(() => {
                updateContactNameDisplay();
            }, 100);

            // Load messages
            messages = conversation.messages || [];
            loadMessages();

            hideAISpinner();
            showNotification(`✅ Conversation générée avec succès ! ${result.fallback ? '(Mode de secours utilisé)' : ''}`, 'success');

            // Scroll to messages section
            document.querySelector('#messagesContainer').scrollIntoView({ behavior: 'smooth' });

            // Auto-save to update Remotion
            setTimeout(() => {
                autoSaveAndConfigure('Génération IA terminée');
            }, 1000);

        } else {
            throw new Error(result.error || 'Erreur lors de la génération IA');
        }

    } catch (error) {
        hideAISpinner();
        showNotification(`Erreur IA: ${error.message}`, 'error');
        openAIModal(); // Reopen modal on error
    } finally {
        if (loading) loading.classList.remove('show');
        button.disabled = false;
    }
}

