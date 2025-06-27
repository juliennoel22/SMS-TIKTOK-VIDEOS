# Interface Web - Générateur de Vidéos iMessages

Cette interface web facilite la création et configuration de vidéos iMessages pour TikTok. Elle se concentre sur la configuration des paramètres et l'édition des conversations, puis redirige vers Remotion Studio pour la prévisualisation et le rendu.

## 🌟 Fonctionnalités de l'interface

### ✅ **Création intuitive de conversations**
- Interface drag & drop pour réorganiser les messages
- Prévisualisation en temps réel style iMessage
- Templates prédéfinis pour différents scénarios

### ✅ **Configuration centralisée**
- Paramètres visuels (thème sombre/clair)
- Réglages de timing et d'animation
- Options audio et effets sonores
- Mise à jour automatique du code source

### ✅ **Intégration Remotion**
- Sauvegarde automatique dans le bon format
- Configuration automatique des imports
- Lancement direct de Remotion Studio
- Workflow optimisé pour la création vidéo

## 🚀 Démarrage de l'interface

### 1. Installer les dépendances
```bash
npm install express cors
```

### 2. Lancer l'interface web
```bash
npm run interface
```

### 3. Ouvrir l'interface
Rendez-vous sur [http://localhost:3001/interface.html](http://localhost:3001/interface.html)

## 📖 Guide d'utilisation

### Étape 1 : Configuration de base
1. **Nom du contact** : Entrez le nom qui apparaîtra en haut de la conversation
2. **Genre** : Sélectionnez masculin ou féminin (pour la voix et l'avatar)
3. **Hook** : Écrivez l'accroche qui apparaît au début de la vidéo
4. **CTA** : Rédigez l'appel à l'action de fin de vidéo

### Étape 2 : Création des messages
1. Cliquez sur **"Ajouter un message"**
2. Choisissez **l'expéditeur** (Utilisateur ou Contact)
3. **Tapez le texte** du message
4. Utilisez les flèches pour **réorganiser** les messages
5. La **prévisualisation** se met à jour automatiquement

### Étape 3 : Paramètres vidéo
- **Thème** : Choisissez entre interface claire ou sombre
- **Durée par message** : Ajustez le timing d'affichage (en frames)
- **Délai initial** : Définissez l'attente avant le premier message
- **Options** : Activez la barre de saisie et l'audio si souhaité

### Étape 4 : Sauvegarde et configuration
1. **Sauvegarder & Configurer** : Applique tous les changements au code source
2. **Ouvrir Remotion Studio** : Lance l'interface Remotion pour la suite

### Étape 5 : Dans Remotion Studio
1. **Prévisualisez** votre vidéo en temps réel
2. **Ajustez** si nécessaire (retour à l'interface web)
3. **Générez l'audio** avec `npm run gen-audio` dans le terminal
4. **Rendez la vidéo** au format MP4

## 🎨 Templates disponibles

L'interface inclut plusieurs templates prêts à l'emploi :

- **Jalousie - Collègue** : Conversation sur une relation ambiguë
- **Mensonge - Sortie** : Découverte d'un mensonge
- **Trahison - Meilleure amie** : Conflit entre amies

## ⚡ Raccourcis clavier

- `Ctrl + S` : Sauvegarder et configurer
- `Ctrl + Entrée` : Ajouter un nouveau message
- `Ctrl + R` : Ouvrir Remotion Studio
- `Échap` : Fermer les modales

## 🔧 Fonctionnement technique

### Flux de travail automatisé
1. L'interface génère un fichier JSON dans `public/conversations/`
2. Le serveur met automatiquement à jour `src/Sms.tsx` et `src/Root.tsx`
3. Les paramètres visuels sont injectés directement dans le code
4. Remotion Studio utilise la configuration mise à jour

### Architecture simplifiée
```
Interface Web (Port 3001)
├── Configuration : interface.html + script.js
├── API Backend : server.js (Express)
├── Auto-configuration : Mise à jour du code Remotion
└── Remotion Studio (Port 3000) : Prévisualisation et rendu
```

### API Endpoints principaux
- `POST /api/save-and-configure` : Sauvegarde et configure le projet
- `POST /api/start-remotion` : Démarre Remotion Studio
- `GET /api/conversations` : Liste des conversations sauvegardées

## 🎯 Workflow recommandé

### Phase 1 : Configuration (Interface Web)
1. **Ouvrir l'interface** → `npm run interface`
2. **Configurer** conversation, paramètres, messages
3. **Sauvegarder** → applique automatiquement au code
4. **Lancer Remotion** → ouvre l'interface de rendu

### Phase 2 : Production (Remotion Studio)
1. **Prévisualiser** dans Remotion Studio
2. **Générer l'audio** → `npm run gen-audio` si nécessaire
3. **Rendre la vidéo** → export MP4 final
4. **Télécharger** le résultat

## 🛠️ Dépannage

### L'interface ne démarre pas
```bash
# Vérifier le port
netstat -an | findstr :3001

# Changer le port si occupé (dans server.js)
const PORT = 3002;
```

### Remotion Studio ne s'ouvre pas
```bash
# Démarrer manuellement
npm run dev

# Vérifier le port 3000
netstat -an | findstr :3000
```

### Configuration non appliquée
- Vérifiez que `src/Sms.tsx` et `src/Root.tsx` existent
- Redémarrez Remotion Studio après changements
- Vérifiez les logs du serveur pour les erreurs

## � Conseils d'optimisation

### Pour des vidéos engageantes
1. **Hooks percutants** : Accrochez en 3 secondes
2. **Messages courts** : 10-15 mots maximum
3. **Rythme soutenu** : Alternez rapidement les échanges
4. **CTA efficaces** : Questions qui incitent aux commentaires

### Workflow efficace
1. **Templates** : Partez d'un modèle existant
2. **Paramètres** : Définissez une fois, réutilisez
3. **Prévisualisation** : Testez avant le rendu final
4. **Batch production** : Configurez plusieurs vidéos d'affilée

---

**Cette interface transforme la création de vidéos iMessages en un processus simple et intuitif, en séparant clairement la configuration de la production !** 🎬✨
