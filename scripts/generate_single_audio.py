import sys
from gtts import gTTS
import os
import io # Pour gérer les données en mémoire
from pydub import AudioSegment # Pour la conversion audio

def generate_audio(text_file_path, output_audio_path):
    try:
        # Lire le texte depuis le fichier en UTF-8
        with open(text_file_path, 'r', encoding='utf-8') as f:
            text = f.read()

        # Vérifier si le texte n'est pas vide
        if not text.strip():
            print(f"Warning: Input text file '{text_file_path}' is empty.")
            return

        # Générer l'audio MP3 en mémoire avec gTTS
        mp3_fp = io.BytesIO()
        tts = gTTS(text=text, lang='fr', slow=False)
        tts.write_to_fp(mp3_fp)
        mp3_fp.seek(0) # Rembobiner le buffer

        # Charger le MP3 depuis la mémoire avec pydub
        audio = AudioSegment.from_file(mp3_fp, format="mp3")

        # Exporter en WAV en spécifiant le codec standard pcm_s16le
        audio.export(output_audio_path, format="wav", codec="pcm_s16le")

    except Exception as e:
        print(f"Error generating audio for {text_file_path}: {e}", file=sys.stderr)
        # Tente de donner plus de détails si pydub échoue (souvent lié à ffmpeg manquant)
        if "pydub" in str(e).lower() or "audiosegment" in str(e).lower():
             print("Pydub error. Ensure ffmpeg is installed and accessible in your system's PATH.", file=sys.stderr)
        sys.exit(1) # Sortir avec un code d'erreur

if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Usage: python generate_single_audio.py <input_text_file> <output_audio_file>", file=sys.stderr)
        sys.exit(1)

    input_file = sys.argv[1]
    output_file = sys.argv[2]

    # Vérifier si le fichier d'entrée existe
    if not os.path.exists(input_file):
        print(f"Error: Input file not found: {input_file}", file=sys.stderr)
        sys.exit(1)

    # Vérifier que le fichier de sortie a l'extension .wav
    if not output_file.lower().endswith(".wav"):
        print(f"Error: Output file must have a .wav extension. Got: {output_file}", file=sys.stderr)
        sys.exit(1)

    generate_audio(input_file, output_file)
