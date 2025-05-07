const say = require("say");
const fs = require("fs");
const path = require("path");
const os = require("os");
const { exec } = require("child_process");

const conversationPath = path.join(__dirname, "../public/conversations/conv1.json");
const outputDir = path.join(__dirname, "../public/audio");

if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
} else {
    // Vide le dossier audio avant de générer les nouveaux fichiers
    for (const file of fs.readdirSync(outputDir)) {
        fs.unlinkSync(path.join(outputDir, file));
    }
}

// Détection de la voix masculine selon l'OS
let voiceName = null;
const platform = os.platform();
if (platform === "darwin") {
    // macOS : voix masculine naturelle
    voiceName = "Thomas"; // Français, masculin, naturel
} else if (platform === "win32") {
    // Vérifie si la voix existe, sinon utilise la voix par défaut
    // "Microsoft Paul Desktop" n'est pas toujours installée, donc fallback automatique
    voiceName = null;
} else if (platform === "linux") {
    // Linux/espeak : tente "fr+m3" (masculin)
    voiceName = "fr+m3";
}

// Charge la conversation
const conversation = JSON.parse(fs.readFileSync(conversationPath, "utf-8"));

// ASTUCE : Pour une voix plus naturelle et de meilleure qualité gratuitement, utilise Google Translate TTS (gtts) en ligne de commande via Python.
// 1. Installe Python et gtts : pip install gtts
// 2. Ce script va appeler gtts-cli pour chaque message et générer un .mp3 de bonne qualité (voix Google, bien meilleure que say).

// Pour utiliser ce script :
// 1. Assure-toi d'avoir Python installé (https://www.python.org/downloads/)
// 2. Installe gtts en ligne de commande : pip install gtts
// 3. Ajoute le dossier Scripts de Python à ton PATH si besoin (ex: C:\Python312\Scripts)
// 4. Vérifie que la commande fonctionne : gtts-cli --version
// 5. Lance ce script Node.js : node scripts/generate-voiceoff.js
// Les fichiers audio seront générés dans public/audio/ et utilisables dans Remotion.


// N'utilise pas d'espaces autour du / ou des tirets dans le nom du fichier.
// Si tu es dans le dossier racine du projet, cette commande fonctionne sur Windows, Mac et Linux.

async function generateVoiceOff() {
    for (let i = 0; i < conversation.messages.length; i++) {
        const msg = conversation.messages[i];
        // Change l'extension en .wav
        const filename = `audio_${msg.sender}_${i}.wav`;
        const outPath = path.join(outputDir, filename);

        if (fs.existsSync(outPath)) fs.unlinkSync(outPath);

        // Utilise un fichier temporaire pour passer le texte au script Python
        const tmpFile = path.join(outputDir, `tmp_text_${i}.txt`);
        const textToWrite = msg.text || "";
        fs.writeFileSync(tmpFile, textToWrite, { encoding: "utf8" });

        await new Promise((resolve, reject) => {
            // Appelle le script Python en passant les chemins des fichiers (.wav pour la sortie)
            const command = `python scripts/generate_single_audio.py "${tmpFile}" "${outPath}"`;
            exec(command, (err, stdout, stderr) => {
                // Supprime le fichier temporaire même en cas d'erreur
                try {
                    if (fs.existsSync(tmpFile)) {
                        fs.unlinkSync(tmpFile);
                    }
                } catch (unlinkErr) {
                    console.error(`Erreur lors de la suppression du fichier temporaire ${tmpFile}:`, unlinkErr);
                }

                if (err) {
                    // L'erreur est déjà affichée par le script Python via stderr
                    console.error(`Erreur Python pour ${filename}.`);
                    reject(err);
                } else {
                    // Met à jour le message de log
                    console.log(`Généré: ${filename} (Google TTS via Python -> WAV)`);
                    resolve();
                }
            });
        });
    }
    // Met à jour le message final
    console.log("✅ Génération terminée (Google TTS via Python -> WAV) !");
}

generateVoiceOff();


