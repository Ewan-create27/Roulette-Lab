# Roulette Lab — site indépendant

Version complète : diagramme modifiable, historique exportable, statistiques en direct, vitesses jusqu’à ×40 et dernier all-in optionnel.

## Publier sur GitHub Pages

1. Décompressez le ZIP.
2. Créez un dépôt public `roulette-lab` sur GitHub.
3. **Add file → Upload files** : ajoutez le contenu du dossier décompressé, pas le ZIP ni le dossier parent. `index.html` doit être directement à la racine du dépôt. Validez avec **Commit changes**.
4. Ouvrez **Settings → Pages**.
5. Choisissez **Deploy from a branch**, branche **main**, dossier **/(root)**, puis **Save**.
6. Après publication, le lien apparaît dans cette page : généralement `https://VOTRE-PSEUDO.github.io/roulette-lab/`.

Aucun build, clé API, compte ChatGPT ou serveur applicatif nécessaire. Le fichier `.nojekyll` désactive le traitement Jekyll si vous l’ajoutez également.

Guide officiel : https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site

## Mettre à jour

Remplacez les fichiers modifiés dans le même dépôt et validez les changements. GitHub Pages republiera le site. Conservez la même adresse pour retrouver les données du navigateur.

## Sauvegardes et indépendance

- Application statique HTML/CSS/JavaScript, indépendante de ChatGPT.
- Pas de compte utilisateur ni de synchronisation entre appareils.
- Stratégie et disposition conservées dans localStorage ; historique dans IndexedDB, dans chaque navigateur.
- Les données de l’ancienne adresse ne migrent pas automatiquement. Exportez les historiques CSV/JSON depuis l’ancien site avant de changer d’adresse. Il n’existe pas de fonction d’import JSON dans cette version : ces exports servent à l’analyse et à l’archivage. Recréez votre stratégie sur le nouveau site.
- Une mise à jour des fichiers à la même adresse ne supprime pas à elle seule les sauvegardes. Changer de domaine/navigateur ou effacer les données du navigateur peut les rendre indisponibles. Conservez des exports.
- Le dépôt et le site proposés ici sont publics. Les historiques ne sont pas envoyés à GitHub.
- Seule ressource externe : les polices Google Fonts. Des polices système prennent le relais si elles sont indisponibles. Pour supprimer cette requête, retirez la première ligne `@import` de `style.css`.

## Essayer sur votre ordinateur

Avec Python installé, ouvrez un terminal dans ce dossier :

```sh
python -m http.server 8000
```

Ouvrez ensuite `http://localhost:8000`. Gardez le terminal ouvert. Un serveur local est préférable au double-clic sur index.html pour le stockage du navigateur.

## Tests et code

Avec Node.js installé : `npm test`. Aucune installation de dépendances requise. Ces tests vérifient les calculs et modèles, pas le rendu visuel.

- `index.html`, `style.css` : interface.
- `engine.js`, `app.js` : règles et simulation.
- `graph.js`, `graph-model.js` : diagramme.
- `chart-hover.js` : survol de la courbe.
- `stats-model.js`, `live-stats.js` : statistiques.
- `journal.js`, `journal-model.js` : historique et exports.
- `workspace.js` : dispositions et zoom.
- `workspace-model.js`, `test-workspace.cjs` : ancien modèle conservé mais non chargé par l’interface actuelle.

Sommes en centièmes de crédit dans le moteur ; tirages via le générateur cryptographique du navigateur. Aucun argent réel manipulé.
