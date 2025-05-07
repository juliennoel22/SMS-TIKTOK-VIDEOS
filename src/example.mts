import { ElevenLabsClient } from "elevenlabs";
import "dotenv/config";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { v4 as uuid } from "uuid";

// Try to load API key from .env or fallback file if not set
if (!process.env.ELEVENLABS_API_KEY) {
    // Try to read from elevenlabs_api_key.env
    const keyPath = "./elevenlabs_api_key.env";
    if (fs.existsSync(keyPath)) {
        const key = fs.readFileSync(keyPath, "utf-8").trim();
        process.env.ELEVENLABS_API_KEY = key;
    }
}

if (!process.env.ELEVENLABS_API_KEY) {
    throw new Error("ELEVENLABS_API_KEY is not set in your environment variables or elevenlabs_api_key.env file.");
}

// Correction pour __dirname dans un module ES
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const client = new ElevenLabsClient({ apiKey: process.env.ELEVENLABS_API_KEY });

// Load conversation JSON
const conversationPath = path.join(__dirname, "../public/conversations/conv1.json");
const conversation = JSON.parse(fs.readFileSync(conversationPath, "utf-8"));

// IDs de voix à utiliser selon le genre
const VOICE_ID_MALE = "xO2Q4ARMEd4BI2sGDH9c";
const VOICE_ID_FEMALE = "Ka6yOFdNGhzFuCVW6VyO";
const MODEL_ID = "eleven_multilingual_v2";
const OUTPUT_FORMAT = "mp3_44100_128"; // Par défaut, mais on va forcer un format compatible navigateur

// Pour une compatibilité maximale avec Remotion/Chrome, préfère le format WAV PCM (non compressé)
// ou un MP3 standard (évite ogg, opus, aac, etc.)
// ElevenLabs supporte "pcm_44100" (WAV) ou "mp3_44100_128" (MP3 standard)
// Pour WAV : "pcm_44100"
// Pour MP3 : "mp3_44100_128"
// Utilise le format MP3 standard compatible avec le plan gratuit ElevenLabs
const SAFE_OUTPUT_FORMAT = "mp3_44100_128"; // MP3 128kbps 44.1kHz

// Dossier de sortie pour les fichiers audio
const outputDir = path.join(__dirname, "../public/audio");
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
} else {
    // Supprime tous les fichiers du dossier audio avant génération
    for (const file of fs.readdirSync(outputDir)) {
        fs.unlinkSync(path.join(outputDir, file));
    }
}

// Paramètres de genre à synchroniser avec Sms.tsx
const botGender: "male" | "female" = conversation.gender === "female" ? "female" : "male";
// À synchroniser avec la prop userGender passée à Sms
const userGender: "male" | "female" = "male"; // ou "female"

async function generateAllAudios() {
    for (let i = 0; i < conversation.messages.length; i++) {
        const message = conversation.messages[i];
        let voiceId: string;

        if (message.sender === "bot") {
            voiceId = botGender === "female" ? VOICE_ID_FEMALE : VOICE_ID_MALE;
        } else {
            voiceId = userGender === "female" ? VOICE_ID_FEMALE : VOICE_ID_MALE;
        }

        try {
            const audioStream = await client.textToSpeech.convertAsStream(voiceId, {
                text: message.text,
                model_id: MODEL_ID,
                output_format: SAFE_OUTPUT_FORMAT, // <-- MP3 standard (compatible Free)
                voice_settings: {
                    stability: 0,
                    similarity_boost: 1.0,
                    use_speaker_boost: true,
                    speed: 1.0,
                },
            });
            // Extension .mp3 pour MP3
            const ext = "mp3";
            const audioPath = path.join(
                outputDir,
                `audio_${message.sender}_${i}.${ext}`
            );
            const fileStream = fs.createWriteStream(audioPath);
            for await (const chunk of audioStream) {
                fileStream.write(chunk);
            }
            fileStream.end();
            await new Promise<void>((resolve, reject) => {
                fileStream.on("finish", resolve);
                fileStream.on("error", reject);
            });
            console.log(`Audio saved: ${audioPath}`);
        } catch (err: any) {
            // Affiche le détail du body d'erreur pour comprendre le 403
            let errorBody = "";
            if (err.body && typeof err.body.getReader === "function") {
                // Si c'est un ReadableStream, essaye de lire le contenu
                try {
                    const reader = err.body.getReader();
                    const { value } = await reader.read();
                    errorBody = value ? Buffer.from(value).toString() : "";
                } catch (e) {
                    errorBody = "[impossible de lire le body]";
                }
            } else if (err.body) {
                errorBody = JSON.stringify(err.body);
            } else if (err.message) {
                errorBody = err.message;
            }
            console.error(
                `Erreur lors de la génération de l'audio pour le message ${i} (${message.sender}):`,
                err.statusCode,
                errorBody
            );
        }
    }
}

generateAllAudios().catch(console.error);
