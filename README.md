# Générateur de Vidéos iMessages pour TikTok

<p align="center">
  <img alt="iMessage Video Generator" src="public/images/i-message-video-generator.jpg" style="max-width: 100%; border-radius: 12px;">
</p>

Ce projet permet de générer automatiquement des vidéos d'échanges iMessages stylisées et animées, parfaites pour TikTok et autres réseaux sociaux. Basé sur [Remotion](https://www.remotion.dev/), il transforme des conversations en vidéos engageantes avec animations de frappe, bulles de messages et audio synthétisé.

## ✨ Fonctionnalités

- ✅ **Interface web intuitive** : Créez vos conversations directement dans le navigateur
- ✅ **Interface iMessage authentique** : Reproduction fidèle de l'interface iOS
- ✅ **Animations fluides** : Apparition progressive des messages avec effet de frappe
- ✅ **Audio synthétisé** : Génération automatique de voix-off avec Google TTS
- ✅ **Génération IA** : Création automatique de conversations avec OpenAI GPT
- ✅ **Personnalisation** : Thèmes sombre/clair, genres de voix, profils utilisateur
- ✅ **Format TikTok** : Optimisé pour les réseaux sociaux (1080x1920)
- ✅ **Rendu automatique** : Génération de vidéos MP4 en un clic

## 🚀 Démarrage rapide

### Prérequis

1. **Installer Node.js** (version 18 ou supérieure)  
   Téléchargez depuis [nodejs.org](https://nodejs.org/)

2. **Installer Git**  
   Téléchargez depuis [git-scm.com](https://git-scm.com/)

3. **Installer VS Code** (recommandé)  
   Téléchargez depuis [code.visualstudio.com](https://code.visualstudio.com/)

### Installation

1. **Cloner le projet**
   ```bash
   git clone [lien du repository]
   cd i-messages-videos
   ```

2. **Installer les dépendances**
   ```bash
   npm install
   ```

3. **Configuration IA**
   
   Renommez le fichier `.env.example` en `.env` dans le dossier racine :
   ```env
   OPENAI_API_KEY=votre_clé_api_openai
   ```
   > 👉 Envoie moi un message pour que je te donne une clé API !

## 🎬 Comment générer une vidéo

### Méthode 1 : Interface Web

> 💡 **Comment ouvrir un terminal :**
> - **Windows** : Appuyez sur `Win + R`, tapez `cmd` ou `powershell`, puis `Entrée`
> - **macOS** : Appuyez sur `Cmd + Espace`, tapez `terminal`, puis `Entrée`
> - **VS Code** : Menu `Terminal` → `Nouveau terminal` ou `Ctrl + ù`

1. **Démarrer l'interface**
   ```bash
   npm start
   ```
   
2. **Démarrer Remotion (dans un nouveau terminal)**
   ```bash
   npm run dev
   ```
   
   L'interface sera accessible sur l'adresse `http://localhost:3001/interface.html`

3. **Créer votre conversation**
   
   **🎯 Démarrage rapide (3 options disponibles) :**
   
   - **Option A - Créer de zéro :** Cliquez sur "Créer de zéro" pour commencer une nouvelle conversation
   - **Option B - Générer avec IA :** Cliquez sur "Générer avec l'IA" et décrivez votre scénario (ex: "Une dispute de couple sur la jalousie")
   - **Option C - Importer JSON :** Cliquez sur "Importer un script JSON" pour coller une conversation existante

3. **Configurer les paramètres**
   
   **Configuration de la conversation :**
   - **Nom du contact** : Le nom affiché en haut de l'écran (ex: Tom, Sarah...)
   - **Genre du contact** : Masculin ou féminin (pour la voix générée)
   - **Hook** : Phrase d'accroche qui apparaît au début (ex: "POV : Il m'a menti...")
   - **Call-to-Action** : Message final pour engager l'audience (ex: "Vous en pensez quoi ?")

   **Paramètres de la vidéo :**
   - **Thème** : Mode clair ou sombre
   - **Durée des messages** : Temps d'affichage de chaque message (recommandé: 60 frames = 2 secondes)
   - **Délai initial** : Pause avant le premier message (recommandé: 120 frames = 4 secondes)
   - **Barre de saisie** : Afficher la zone de texte en bas (optionnel)
   - **Génération audio** : Activer la synthèse vocale automatique

4. **Ajouter vos messages**
   
   Pour chaque message :
   - Sélectionnez "Utilisateur" ou le nom du contact
   - Tapez le contenu du message
   - Utilisez les flèches ↑↓ pour réorganiser
   - Cliquez sur 🗑️ pour supprimer

5. **Générer la vidéo**
   
   **Étape 1 - Sauvegarder :**
   - Cliquez sur "Sauvegarder" pour valider votre conversation
   - Le système configure automatiquement Remotion avec vos paramètres
   
   **Étape 2 - Prévisualiser (optionnel) :**
   - Cliquez sur "Ouvrir Remotion Studio" pour prévisualiser votre vidéo
   - Ajustez si nécessaire et fermez Remotion Studio
   
   **Étape 3 - Rendre la vidéo finale :**
   - Cliquez sur "Faire le rendu" pour générer la vidéo MP4
   - Une barre de progression s'affiche pendant le rendu
   - La vidéo finale est sauvegardée dans le dossier `out/`

   **⏱️ Temps de rendu :** Comptez environ 30 secondes à 2 minutes selon la longueur de votre conversation.

## ⚙️ Paramètres et personnalisation

### Interface Web

L'interface web permet de configurer tous les aspects de votre vidéo :

**Paramètres de conversation :**
- **Nom du contact** : Le nom qui apparaît en haut de l'écran
- **Genre** : Masculin ou féminin (pour la voix générée)
- **Hook** : Phrase d'accroche qui apparaît au début
- **Call-to-Action** : Message final pour engager l'audience

**Paramètres visuels :**
- **Thème** : Clair ou sombre
- **Durée des messages** : Temps d'affichage de chaque message (en frames)
- **Délai initial** : Pause avant le premier message
- **Barre de saisie** : Afficher ou masquer la zone de texte

## 📁 Structure du projet

```
├── public/
│   ├── conversations/          # Fichiers JSON des conversations
│   ├── audio/                  # Fichiers audio générés
│   ├── images/                 # Assets visuels (bulles, icônes)
│   └── sfx/                    # Effets sonores
├── src/
│   ├── components/             # Composants React
│   │   ├── background.tsx      # Interface iMessage
│   │   ├── bubble.tsx          # Bulles de messages
│   │   └── TypingIndicator.tsx # Animation de frappe
│   ├── Root.tsx                # Configuration des compositions
│   └── Sms.tsx                 # Composant principal
└── scripts/
    ├── generate-voiceoff.js    # Génération audio Node.js
    └── generate_single_audio.py # Script Python TTS
```

### Raccourcis clavier dans l'interface

| Raccourci  | Action                      |
| ---------- | --------------------------- |
| `Ctrl + S` | Sauvegarder la conversation |
| `Escape`   | Fermer les modals           |
| `Enter`    | Valider dans les champs     |

## 🎯 Conseils pour créer du contenu viral

### Structure d'une vidéo engageante

1. **Hook percutant (2-3 premières secondes)**
   - Commencez par "POV :" ou "Quand tu découvres que..."
   - Annoncez immédiatement le conflit ou la situation
   - Exemples : "POV : Tu découvres qu'il ment depuis 3 mois", "Quand ta best friend sort avec ton ex"

2. **Développement du suspense (milieu)**
   - Montée en tension progressive
   - Révélations par étapes
   - Messages de plus en plus courts et nerveux

3. **Chute/Révélation (fin)**
   - Twist inattendu ou confirmation des soupçons
   - Derniers messages courts et impactants
   - Laissez sur une note ouverte pour encourager les commentaires

### Timing optimal pour TikTok

- **Durée totale :** 15-45 secondes (sweet spot : 20-30 secondes)
- **Messages :** 6-15 échanges maximum
- **Rythme :** 1.5-3 secondes par message (accélérez vers la fin)
- **Hook :** 3-5 secondes pour captiver
- **Chute :** Les 5 dernières secondes sont cruciales

### Émotions qui performent

**💔 Relations amoureuses :**
- Jalousie, tromperie, manipulation
- "Il/elle me ment", "J'ai découvert que...", "Ses ex qui reviennent"

**👥 Amitié & Famille :**
- Trahisons, secrets révélés, manipulations
- "Ma best friend...", "Ma sœur m'a...", "Mes parents cachent..."

**🎭 Situations du quotidien :**
- Workplace drama, voisins toxiques, colocs impossibles
- "Mon boss...", "Mon collègue...", "Mon/ma coloc..."

### Call-to-Action efficaces

**Engagement émotionnel :**
- "Vous auriez fait quoi à ma place ?"
- "Team [Personnage A] ou Team [Personnage B] ?"
- "Qui a déjà vécu ça ? 😭"

**Questions ouvertes :**
- "Dites-moi tout en commentaire !"
- "Vous en pensez quoi honnêtement ?"
- "J'ai bien fait ou pas ?"

**Appel à l'expérience :**
- "Racontez-moi vos histoires similaires"
- "Qui a des conseils ?"
- "Comment vous auriez réagi ?"

### Thèmes qui fonctionnent

- 💔 **Relations** : Disputes, jalousie, ruptures
- 🤥 **Mensonges** : Découverte de secrets, trahisons
- 👥 **Amitié** : Conflits, manipulations
- 🏠 **Famille** : Tensions, révélations
- 💼 **Travail** : Dramas de bureau, rivalités

## 📚 Ressources

### Documentation
- [Remotion Fundamentals](https://www.remotion.dev/docs/the-fundamentals) - Apprendre les bases de Remotion
- [Remotion API](https://www.remotion.dev/docs/api) - Référence de l'API
- [React Documentation](https://react.dev/) - Guide React

### Support
- [Discord Remotion](https://discord.gg/6VzzNDwUwV) - Communauté d'aide
- [GitHub Issues](https://github.com/remotion-dev/remotion/issues/new) - Signaler un problème

### Technologies utilisées
- **Remotion** - Framework de génération vidéo
- **React** - Interface utilisateur
- **TypeScript** - Typage statique
- **Tailwind CSS** - Styles
- **Express.js** - Serveur web
- **Google TTS** - Synthèse vocale
- **OpenAI GPT** - Génération IA
- **Python** - Scripts audio

---

## 🎬 Exemples pratiques complets

### Exemple 1 : Génération avec IA

```bash
# 1. Démarrer l'interface
npm start

# 2. Dans l'interface web :
#    - Cliquer sur "Générer avec l'IA"
#    - Prompt : "Une fille découvre que son copain la trompe avec sa meilleure amie"
#    - Durée : 30 secondes
#    - Cliquer sur "Générer la conversation"

# 3. Après génération automatique :
#    - Vérifier/modifier les messages si besoin
#    - Cliquer sur "Sauvegarder"
#    - Cliquer sur "Faire le rendu"

# ⏱️ Temps total : 2-3 minutes
```

### Exemple 2 : Création manuelle complète

**Fichier : `public/conversations/jalousie-jenny.json`**
```json
{
  "botName": "Alex",
  "gender": "male",
  "hook": "POV : Il dit que c'est \"juste une amie\"...",
  "CTA": "Les red flags étaient là depuis le début 🚩\nVous en pensez quoi ?",
  "messages": [
    {"sender": "user", "text": "Tu fais quoi ce soir ?"},
    {"sender": "bot", "text": "Je traîne avec Jenny"},
    {"sender": "user", "text": "Jenny... encore ?"},
    {"sender": "bot", "text": "C'est juste une amie relax"},
    {"sender": "user", "text": "Une \"amie\" qui t'envoie des 💕 à 2h du mat ?"},
    {"sender": "bot", "text": "Comment tu sais ça ?"},
    {"sender": "user", "text": "J'ai vu ton tel cette nuit"},
    {"sender": "bot", "text": "..."},
    {"sender": "user", "text": "Alors ?"},
    {"sender": "bot", "text": "On peut en parler quand je rentre ?"},
    {"sender": "user", "text": "Rentre pas."}
  ]
}
```

**Commandes :**
```bash
# Générer avec audio
npm run gen-audio

# Prévisualiser
npm run dev
# → Ouvrir http://localhost:3000

# Rendre la vidéo finale
npx remotion render Sms out/jalousie-jenny.mp4
```

### Exemple 3 : Workflow optimisé pour créateurs

```bash
# Setup initial (une seule fois)
git clone [votre-repo]
cd i-messages-videos
npm install
echo "OPENAI_API_KEY=sk-votre-clé" > .env

# Workflow quotidien de création
npm start

# Dans l'interface :
# 1. Générer 3-4 conversations avec IA (thèmes différents)
# 2. Modifier/optimiser chaque conversation 
# 3. Rendre toutes les vidéos
# 4. Upload sur TikTok/Instagram

# 📊 Résultat : 3-4 vidéos prêtes en 15-20 minutes
```

### Exemple 4 : Intégration avec vos propres scripts

**Script Python pour génération en masse :**
```python
import subprocess
import json
import os

themes = [
    "Une dispute de couple sur l'argent",
    "Découverte d'une tromperie par les réseaux sociaux", 
    "Conflit entre colocataires",
    "Drama familial autour d'un héritage"
]

for i, theme in enumerate(themes):
    # Générer via API
    subprocess.run([
        "curl", "-X", "POST", 
        "http://localhost:3001/api/generate-ai",
        "-H", "Content-Type: application/json",
        "-d", json.dumps({"prompt": theme, "length": "court"})
    ])
    
    # Rendre la vidéo
    output = f"out/video_{i+1}.mp4"
    subprocess.run([
        "npx", "remotion", "render", "Sms", output
    ])
    
print("✅ 4 vidéos générées automatiquement !")
```

## 📄 Licence

Ce projet utilise [Remotion](https://remotion.dev) qui peut nécessiter une licence commerciale pour certains usages. Consultez la [documentation Remotion](https://www.remotion.dev/license) pour plus d'informations.

---

<div align="center">

**🎬 Créé avec [Remotion](https://remotion.dev) 🎬**

*Générateur de vidéos iMessages pour créateurs de contenu*

---

## 📜 Licence et Protection

**© 2025 - Tous droits réservés**

Ce logiciel est protégé par une licence propriétaire. Toute utilisation, copie, modification ou distribution non autorisée est strictement interdite et constitue une violation du droit d'auteur.

**⚠️ AVERTISSEMENT :** Ce code est la propriété exclusive de son auteur. L'utilisation sans autorisation peut entraîner des poursuites judiciaires.

Voir le fichier `LICENSE` pour les conditions complètes.

</div>
