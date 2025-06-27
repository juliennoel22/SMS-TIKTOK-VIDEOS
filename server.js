const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const { exec } = require('child_process');
const cors = require('cors');
const OpenAI = require('openai');
require('dotenv').config();

const app = express();
const PORT = 3001;

// Initialize OpenAI client
let openaiClient = null;
if (process.env.OPENAI_API_KEY) {
    openaiClient = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
    });
} else {
    console.warn('⚠️  OPENAI_API_KEY non trouvée. La génération IA ne sera pas disponible.');
}

// Middleware
app.use(express.json());
app.use(cors());
app.use(express.static('.'));

// Serve static files
app.use('/public', express.static('public'));

// API Routes

// Get all conversations
app.get('/api/conversations', async (req, res) => {
    try {
        const conversationsDir = path.join(__dirname, 'public', 'conversations');
        const files = await fs.readdir(conversationsDir);
        const conversations = [];

        for (const file of files) {
            if (file.endsWith('.json')) {
                const filePath = path.join(conversationsDir, file);
                const content = await fs.readFile(filePath, 'utf8');
                const conversation = JSON.parse(content);
                conversations.push({
                    filename: file,
                    ...conversation
                });
            }
        }

        res.json(conversations);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Save conversation and configure project
app.post('/api/save-and-configure', async (req, res) => {
    try {
        const { conversation, settings } = req.body;

        console.log('=== SAVE AND CONFIGURE DEBUG ===');
        console.log('Conversation reçue:', JSON.stringify(conversation, null, 2));
        console.log('Settings reçus:', JSON.stringify(settings, null, 2));

        if (!conversation || !conversation.messages || conversation.messages.length === 0) {
            return res.status(400).json({ error: 'Conversation invalide' });
        }

        const conversationsDir = path.join(__dirname, 'public', 'conversations');
        await fs.mkdir(conversationsDir, { recursive: true });

        const filename = `conversation-main.json`;
        const filePath = path.join(conversationsDir, filename);

        // Save conversation file
        await fs.writeFile(filePath, JSON.stringify(conversation, null, 2));
        console.log('Fichier conversation sauvegardé:', filePath);

        // Update src/Sms.tsx with new import and settings
        await updateSmsConfiguration(filename, settings);

        // Update Root.tsx for dynamic duration calculation and gender configuration
        await updateRootConfiguration(filename, conversation);

        res.json({
            success: true,
            filename: filename,
            message: 'Conversation et configuration sauvegardées avec succès'
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Start Remotion Studio
app.post('/api/start-remotion', async (req, res) => {
    try {
        // Check if Remotion is already running
        exec('netstat -an | findstr :3000', (error, stdout, stderr) => {
            if (stdout) {
                // Port 3000 is already in use
                res.json({
                    success: true,
                    message: 'Remotion Studio est déjà en cours d\'exécution sur http://localhost:3000',
                    alreadyRunning: true
                });
            } else {
                // Start Remotion Studio
                exec('npm run dev', { cwd: __dirname }, (error, stdout, stderr) => {
                    if (error) {
                        console.error('Erreur démarrage Remotion:', error);
                    }
                });

                res.json({
                    success: true,
                    message: 'Remotion Studio démarré sur http://localhost:3000',
                    alreadyRunning: false
                });
            }
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Generate audio for conversation
app.post('/api/generate-audio', async (req, res) => {
    try {
        const { conversationFile } = req.body;

        if (!conversationFile) {
            return res.status(400).json({ error: 'Nom du fichier de conversation requis' });
        }

        // Update generate-voiceoff.js to use the specified conversation
        await updateAudioScript(conversationFile);

        // Run the audio generation script
        const audioResult = await runCommand('npm run gen-audio');

        res.json({
            success: true,
            message: 'Audio généré avec succès',
            output: audioResult
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Render video
app.post('/api/render-video', async (req, res) => {
    try {
        const {
            conversationFile,
            outputName,
            settings = {}
        } = req.body;

        if (!conversationFile) {
            return res.status(400).json({ error: 'Nom du fichier de conversation requis' });
        }

        // Update video settings if provided
        if (Object.keys(settings).length > 0) {
            await updateSmsConfiguration(conversationFile, settings);
        } else {
            // Just update the import if no settings provided
            await updateSmsConfiguration(conversationFile, {});
        }

        const finalOutputName = outputName || `video-${Date.now()}.mp4`;

        // Ensure output directory exists
        const outputDir = path.join(__dirname, 'out');
        await fs.mkdir(outputDir, { recursive: true });

        // Standard render without trimming (trimming is now handled separately)
        const renderResult = await runCommand(`npx remotion render Sms out/${finalOutputName}`);

        res.json({
            success: true,
            message: 'Vidéo rendue avec succès',
            filename: finalOutputName,
            output: renderResult
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Start Remotion preview
app.post('/api/preview', async (req, res) => {
    try {
        const { conversationFile } = req.body;

        if (conversationFile) {
            await updateSmsConfiguration(conversationFile, {});
        }

        // Start Remotion studio in background
        exec('npm run dev', (error, stdout, stderr) => {
            if (error) {
                console.error('Erreur preview:', error);
            }
        });

        res.json({
            success: true,
            message: 'Aperçu démarré sur http://localhost:3000',
            previewUrl: 'http://localhost:3000'
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Check AI configuration
app.get('/api/ai-status', (req, res) => {
    res.json({
        available: !!openaiClient,
        hasApiKey: !!process.env.OPENAI_API_KEY
    });
});

// AI Generation endpoint
app.post('/api/generate-ai', async (req, res) => {
    try {
        const { prompt, tone, length } = req.body;

        if (!prompt) {
            return res.status(400).json({ error: 'Prompt requis pour la génération IA' });
        }

        if (!openaiClient) {
            return res.status(500).json({
                error: 'API OpenAI non configurée. Vérifiez votre clé API dans le fichier .env'
            });
        }

        // Read the prompt template
        const promptTemplate = await fs.readFile(path.join(__dirname, 'prompt.txt'), 'utf8');

        // Create the full prompt with user's request
        const fullPrompt = `${promptTemplate}\n\nDemande spécifique: ${prompt}\nTone: ${tone}\nLongueur: ${length}`;

        console.log('🤖 Génération IA en cours...');

        // Call OpenAI API
        const completion = await openaiClient.chat.completions.create({
            model: "gpt-4o",
            messages: [
                { role: "user", content: fullPrompt }
            ],
            temperature: 0.7,
            max_tokens: 1000,
            top_p: 0.9
        });

        const output = completion.choices[0].message.content;
        console.log('✅ Réponse OpenAI reçue');

        // Clean the output to remove markdown
        const cleanedOutput = output.replace(/```json|```/g, "").trim();

        // Parse and validate JSON
        let conversation;
        try {
            conversation = JSON.parse(cleanedOutput);

            // Validate required fields
            if (!conversation.botName || !conversation.messages || !Array.isArray(conversation.messages)) {
                throw new Error('Format de réponse invalide');
            }

            // Ensure all required fields are present
            conversation.gender = conversation.gender || 'male';
            conversation.hook = conversation.hook || 'POV : Une conversation intéressante...';
            conversation.CTA = conversation.CTA || 'Que pensez-vous ?';

        } catch (parseError) {
            console.error('Erreur lors de l\'analyse du JSON généré:', parseError.message);
            console.log('Réponse brute:', cleanedOutput);

            // Fallback to template-based generation
            conversation = generateConversationFromTopic(prompt);
        }

        // Save the generated conversation
        const conversationsDir = path.join(__dirname, 'public', 'conversations');
        await fs.mkdir(conversationsDir, { recursive: true });

        const filename = `conversation-main.json`;
        const filePath = path.join(conversationsDir, filename);

        await fs.writeFile(filePath, JSON.stringify(conversation, null, 2));
        console.log(`💾 Conversation sauvegardée: ${filename}`);

        res.json({
            success: true,
            conversation: conversation,
            filename: filename
        });
    } catch (error) {
        console.error('Erreur génération IA:', error.message);

        // Fallback to template-based generation
        try {
            const conversation = generateConversationFromTopic(req.body.prompt || 'conversation');
            res.json({
                success: true,
                conversation: conversation,
                fallback: true,
                message: 'Génération de secours utilisée (erreur API)'
            });
        } catch (fallbackError) {
            res.status(500).json({ error: error.message });
        }
    }
});

// Helper functions

async function updateSmsConfiguration(conversationFile, settings) {
    try {
        const smsPath = path.join(__dirname, 'src', 'Sms.tsx');
        let content = await fs.readFile(smsPath, 'utf8');

        // Update import line
        const importRegex = /import conversation from ["']\.\.\/public\/conversations\/[^"']+["'];/;
        const newImport = `import conversation from "../public/conversations/${conversationFile}";`;

        if (importRegex.test(content)) {
            content = content.replace(importRegex, newImport);
        } else {
            // Add import if not found (after the TypingInput import)
            const insertAfter = 'import { TypingInput } from "./components/TypingInput";';
            const insertIndex = content.indexOf(insertAfter);
            if (insertIndex !== -1) {
                const lineEnd = content.indexOf('\n', insertIndex) + 1;
                content = content.slice(0, lineEnd) + newImport + '\n' + content.slice(lineEnd);
            }
        }

        // Update video settings
        if (settings.darkTheme !== undefined) {
            content = content.replace(
                /const darkTheme = [^;]+;/,
                `const darkTheme = ${settings.darkTheme};`
            );
        }

        if (settings.showTypingInputBar !== undefined) {
            content = content.replace(
                /const showTypingInputBar = [^;]+;/,
                `const showTypingInputBar = ${settings.showTypingInputBar};`
            );
        }

        if (settings.enableAudioGeneration !== undefined) {
            content = content.replace(
                /const enableAudioGeneration = [^;]+;/,
                `const enableAudioGeneration = ${settings.enableAudioGeneration};`
            );
        }

        if (settings.messageDuration !== undefined) {
            content = content.replace(
                /export const messageDuration = [^;]+;/,
                `export const messageDuration = ${settings.messageDuration};`
            );
        }

        if (settings.initialDelay !== undefined) {
            content = content.replace(
                /export const initialDelay = [^;]+;/,
                `export const initialDelay = ${settings.initialDelay};`
            );
        }

        await fs.writeFile(smsPath, content);
    } catch (error) {
        console.error('Erreur mise à jour configuration Sms.tsx:', error);
    }
}

async function updateRootConfiguration(conversationFile, conversationData = null) {
    try {
        const rootPath = path.join(__dirname, 'src', 'Root.tsx');
        let content = await fs.readFile(rootPath, 'utf8');

        // Update import line in Root.tsx
        const importRegex = /import conversation from ["']\.\.\/public\/conversations\/[^"']+["'];/;
        const newImport = `import conversation from "../public/conversations/${conversationFile}";`;

        if (importRegex.test(content)) {
            content = content.replace(importRegex, newImport);
        } else {
            // Add import if not found (after the Test import)
            const insertAfter = 'import { Test } from "./Test";';
            const insertIndex = content.indexOf(insertAfter);
            if (insertIndex !== -1) {
                const lineEnd = content.indexOf('\n', insertIndex) + 1;
                content = content.slice(0, lineEnd) + newImport + '\n' + content.slice(lineEnd);
            }
        }

        // Update botGender and userGender if conversation data is provided
        if (conversationData) {
            console.log('Mise à jour du genre avec:', conversationData.gender);

            // Update botGender based on conversation.gender
            const botGenderRegex = /botGender: conversation\.gender === ["']female["'] \? ["']female["'] : ["']male["']/;
            const newBotGender = `botGender: conversation.gender === "female" ? "female" : "male"`;

            if (botGenderRegex.test(content)) {
                content = content.replace(botGenderRegex, newBotGender);
                console.log('Regex de botGender trouvé et remplacé');
            } else {
                console.log('Regex de botGender non trouvé dans Root.tsx');
            }

            // Note: userGender stays as "male" by default, but could be made configurable later
        }

        // Add/update a comment with timestamp to force hot reload
        const timestampRegex = /\/\/ Updated: \d+/;
        const newTimestamp = `// Updated: ${Date.now()}`;

        if (timestampRegex.test(content)) {
            content = content.replace(timestampRegex, newTimestamp);
        } else {
            // Add timestamp comment after the imports
            const afterImports = content.indexOf('const typingDuration');
            if (afterImports !== -1) {
                content = content.slice(0, afterImports) + newTimestamp + '\n' + content.slice(afterImports);
            }
        }

        await fs.writeFile(rootPath, content);
    } catch (error) {
        console.error('Erreur mise à jour Root.tsx:', error);
    }
}

async function updateAudioScript(conversationFile) {
    try {
        const scriptPath = path.join(__dirname, 'scripts', 'generate-voiceoff.js');
        let content = await fs.readFile(scriptPath, 'utf8');

        // Update conversation path
        const pathRegex = /const conversationPath = path\.join\(__dirname, ["'][^"']+["']\);/;
        const newPath = `const conversationPath = path.join(__dirname, "../public/conversations/${conversationFile}");`;

        if (pathRegex.test(content)) {
            content = content.replace(pathRegex, newPath);
            await fs.writeFile(scriptPath, content);
        }
    } catch (error) {
        console.error('Erreur mise à jour script audio:', error);
    }
}

async function updateVideoSettings(settings) {
    try {
        const smsPath = path.join(__dirname, 'src', 'Sms.tsx');
        let content = await fs.readFile(smsPath, 'utf8');

        // Update settings in Sms.tsx
        if (settings.darkTheme !== undefined) {
            content = content.replace(
                /const darkTheme = [^;]+;/,
                `const darkTheme = ${settings.darkTheme};`
            );
        }

        if (settings.showTypingInputBar !== undefined) {
            content = content.replace(
                /const showTypingInputBar = [^;]+;/,
                `const showTypingInputBar = ${settings.showTypingInputBar};`
            );
        }

        if (settings.enableAudioGeneration !== undefined) {
            content = content.replace(
                /const enableAudioGeneration = [^;]+;/,
                `const enableAudioGeneration = ${settings.enableAudioGeneration};`
            );
        }

        if (settings.messageDuration !== undefined) {
            content = content.replace(
                /export const messageDuration = [^;]+;/,
                `export const messageDuration = ${settings.messageDuration};`
            );
        }

        if (settings.initialDelay !== undefined) {
            content = content.replace(
                /export const initialDelay = [^;]+;/,
                `export const initialDelay = ${settings.initialDelay};`
            );
        }

        await fs.writeFile(smsPath, content);
    } catch (error) {
        console.error('Erreur mise à jour paramètres vidéo:', error);
    }
}

function runCommand(command) {
    return new Promise((resolve, reject) => {
        exec(command, { cwd: __dirname }, (error, stdout, stderr) => {
            if (error) {
                reject(new Error(`Command failed: ${error.message}\nStderr: ${stderr}`));
            } else {
                resolve(stdout);
            }
        });
    });
}

function generateConversationFromTopic(topic) {
    const names = ['Alex', 'Sarah', 'Tom', 'Emma', 'Lucas', 'Chloé', 'Maxime', 'Léa'];
    const randomName = names[Math.floor(Math.random() * names.length)];
    const randomGender = Math.random() > 0.5 ? 'male' : 'female';

    const topicTemplates = {
        'jalousie': {
            hook: `POV : ${randomName} est jaloux/jalouse de tout...`,
            messages: [
                { sender: "user", text: "Tu étais avec qui ce soir ?" },
                { sender: "bot", text: "Avec des amis, pourquoi ?" },
                { sender: "user", text: "Lesquels ?" },
                { sender: "bot", text: "Tu me surveilles maintenant ?" },
                { sender: "user", text: "Je pose juste une question" },
                { sender: "bot", text: "T'es en train de péter un câble là" }
            ]
        },
        'mensonge': {
            hook: `POV : ${randomName} me ment depuis des semaines...`,
            messages: [
                { sender: "user", text: "Tu m'as dit que tu bossais hier" },
                { sender: "bot", text: "Oui et alors ?" },
                { sender: "user", text: "Marie t'a vu au restaurant" },
                { sender: "bot", text: "Marie ?" },
                { sender: "user", text: "Avec QUI tu étais ?" },
                { sender: "bot", text: "..." }
            ]
        },
        'trahison': {
            hook: `POV : Ma meilleure amie me trahit...`,
            messages: [
                { sender: "user", text: "Alors comme ça tu sors avec mon ex ?" },
                { sender: "bot", text: "Qui t'a dit ça ?" },
                { sender: "user", text: "Tout le monde le sait déjà" },
                { sender: "bot", text: "On peut en parler ?" },
                { sender: "user", text: "NON on peut plus jamais en parler" },
                { sender: "bot", text: "S'il te plaît..." }
            ]
        }
    };

    const template = topicTemplates[topic.toLowerCase()] || topicTemplates['jalousie'];

    return {
        botName: randomName,
        gender: randomGender,
        hook: template.hook,
        CTA: "Vous en pensez quoi ?\nDites-moi tout en commentaire !",
        messages: template.messages
    };
}

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Serveur de l'interface web démarré sur http://localhost:${PORT}`);
    console.log(`📱 Interface disponible sur http://localhost:${PORT}/interface.html`);
    console.log(`🎬 Pour démarrer Remotion: npm run dev`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('👋 Arrêt du serveur...');
    process.exit(0);
});

// Trim video - remove initial delay from rendered video
app.post('/api/trim-video', async (req, res) => {
    try {
        const {
            inputVideoName,
            outputVideoName,
            initialDelayFrames = 120
        } = req.body;

        if (!inputVideoName || !outputVideoName) {
            return res.status(400).json({ error: 'Noms des fichiers vidéo requis' });
        }

        const outputDir = path.join(__dirname, 'out');
        const inputPath = path.join(outputDir, inputVideoName);
        const outputPath = path.join(outputDir, outputVideoName);

        // Check if input video exists
        try {
            await fs.access(inputPath);
        } catch (error) {
            return res.status(404).json({ error: `Fichier vidéo d'entrée non trouvé: ${inputVideoName}` });
        }

        // Calculate trim time: frames to seconds (30fps)
        const trimSeconds = initialDelayFrames / 30;

        console.log(`Découpage de la vidéo: suppression de ${trimSeconds}s (${initialDelayFrames} frames) du début`);

        // Use FFmpeg to trim the video
        const trimResult = await runCommand(`ffmpeg -i "${inputPath}" -ss ${trimSeconds} -c copy "${outputPath}" -y`);

        // Remove temporary input file
        try {
            await fs.unlink(inputPath);
            console.log(`Fichier temporaire supprimé: ${inputVideoName}`);
        } catch (error) {
            console.warn(`Impossible de supprimer le fichier temporaire: ${error.message}`);
        }

        res.json({
            success: true,
            message: 'Vidéo découpée avec succès',
            filename: outputVideoName,
            trimmedSeconds: trimSeconds,
            output: trimResult
        });
    } catch (error) {
        console.error('Erreur lors du découpage vidéo:', error);
        res.status(500).json({ error: error.message });
    }
});
