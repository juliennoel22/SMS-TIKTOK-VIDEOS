import { AbsoluteFill, Audio, Sequence } from 'remotion';
import React from 'react';

// Liste des fichiers audio WAV à tester (assure-toi qu'ils existent dans public/audio)
const audioFiles = [
    "/audio/audio_user_0.wav",
    "/audio/audio_bot_1.wav",
    // Ajoute d'autres fichiers si nécessaire pour tester
];

export const Test = () => {
    return (
        <AbsoluteFill style={{ color: "#fff", background: "#222", fontSize: 32, padding: 40 }}>
            <h2>Test simple lecture audio WAV</h2>
            <ul>
                {audioFiles.map((src, index) => (
                    <li key={src} style={{ marginBottom: 20 }}>
                        <b>{src}</b>
                        {/* Essaye de jouer chaque audio dans une séquence distincte */}
                        <Sequence from={index * 60} durationInFrames={100}>
                            <Audio src={src} volume={1} crossOrigin="anonymous" />
                        </Sequence>
                        {/* Ajoute un lecteur audio HTML5 pour un test manuel direct */}
                        <audio controls src={src} style={{ marginTop: 10, width: 400 }} />
                    </li>
                ))}
            </ul>
            {/* Place le paragraphe explicatif à l'intérieur de AbsoluteFill mais après la liste ul */}
            <p style={{ marginTop: 30 }}>
                Si les lecteurs audio HTML5 fonctionnent mais pas les `Audio` de Remotion,
                    le problème est lié à Remotion ou au serveur de dev.
                    Si aucun ne fonctionne, le fichier WAV est peut-être corrompu ou mal encodé.
            </p>
        </AbsoluteFill> // Ferme correctement AbsoluteFill ici
    );
}; // Ferme correctement le composant Test ici