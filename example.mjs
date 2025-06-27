import OpenAI from "openai";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";

dotenv.config();

if (!process.env.OPENAI_API_KEY) {
    throw new Error("La clé API OPENAI_API_KEY est manquante. Vérifiez votre fichier .env.");
}

const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// Lecture du contenu du fichier prompt.txt
const promptContent = fs.readFileSync("prompt.txt", "utf-8");
// const promptContent = "Write a tiny .json file, only thatn just the output"

const outputDirectory = path.join("public", "conversations");
const outputFileName = "generated-conversation.json";
const outputFilePath = path.join(outputDirectory, outputFileName);

const run = async () => {
    try {
        const completion = await client.chat.completions.create({
            model: "gpt-4o",
            messages: [
                { role: "user", content: promptContent }
            ],
            temperature: 0.7,
            max_tokens: 1000,
            top_p: 0.9
        });

        const output = completion.choices[0].message.content;
        console.log("\n=== Résultat généré ===\n");
        console.log(output);
        console.log("\n=========\n");

        // Nettoyage de l'output pour supprimer les balises Markdown
        const cleanedOutput = output.replace(/```json|```/g, "").trim();

        // Vérification et ajustement du format JSON avant l'enregistrement
        let parsedOutput;
        try {
            parsedOutput = JSON.parse(cleanedOutput);
        } catch (parseError) {
            console.error("Erreur lors de l'analyse du JSON généré :", parseError.message);
            return;
        }

        // Enregistrement de l'output dans un fichier JSON
        if (!fs.existsSync(outputDirectory)) {
            fs.mkdirSync(outputDirectory, { recursive: true });
        }
        try {
            fs.writeFileSync(outputFilePath, JSON.stringify(parsedOutput, null, 2), "utf-8");
            console.log(`Résultat enregistré dans : ${outputFilePath}`);
        } catch (writeError) {
            console.error("Erreur lors de l'enregistrement du fichier :", writeError.message);
        }

    } catch (error) {
        console.error("Erreur lors de l'appel à l'API OpenAI :", error.message);
    }
};

run();
