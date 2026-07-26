# Coach 3D — modèles animés

Ce dossier reçoit les modèles 3D du coach. **Il est vide pour l'instant** : tant
qu'un exercice n'a pas de modèle, sa fiche affiche le schéma vectoriel, qui reste
la solution par défaut (léger, hors ligne, disponible pour les 31 exercices).

## Comment brancher un modèle

1. Déposer le fichier `.glb` dans ce dossier.
2. L'enregistrer dans `index.html`, objet `MODEL3D` :

```js
const MODEL3D={
  mat_squat:      {f:'squat.glb',  a:'Squat'},   // a = nom du clip, facultatif
  board_standard: {f:'pushup.glb'},              // si un seul clip, omettre a
};
```

Le bouton **🧊 3D / 📐 SCHÉMA** apparaît alors automatiquement dans la fiche, et
l'utilisateur peut basculer. Si le fichier est absent ou illisible, la fiche
retombe toute seule sur le schéma.

## Où trouver le personnage et les animations

- **Personnage** : [Mixamo](https://mixamo.com) (gratuit, compte Adobe) fournit
  des personnages riggés prêts à animer. [Ready Player Me](https://readyplayer.me)
  permet un avatar personnalisé. Sinon, un modeleur 3D à partir de l'image de
  référence.
- **Animations** : Mixamo propose un catalogue de mouvements de fitness — cherchez
  les termes anglais (*push up*, *squat*, *jumping jacks*, *burpee*, *sit up*,
  *mountain climber*, *running*, *plank*). Téléchargez l'animation **appliquée au
  personnage**, pas seulement le squelette.
- **Conversion** : Mixamo exporte en FBX. Passer en glTF/GLB via Blender
  (import FBX → export glTF 2.0) ou `FBX2glTF`.
- **Poids** : compresser avec [gltf-transform](https://gltf-transform.dev)
  (`gltf-transform optimize in.glb out.glb --compress draco`). Viser < 2 Mo par
  fichier ; sans compression on monte vite à plusieurs dizaines de Mo au total.

## Couverture réaliste

Les catalogues d'animations couvrent les mouvements courants (pompes, squats,
burpees, jumping jacks, crunchs, mountain climbers, course). En revanche,
**la plupart des exercices de cette app n'ont pas d'équivalent tout fait** :
variantes sur planche push-up (archer, pike, pseudo-planche, diamant), roue
abdominale, élastiques, gainages tenus, chaise, corde à sauter, machines.
Ils demanderaient une animation sur mesure — d'où le repli sur le schéma, conçu
pour rester la solution complète.

## Fonctionnement hors ligne

Le visualiseur est chargé **en priorité depuis ce dossier**, et seulement à
défaut depuis un CDN. Pour que la 3D marche hors ligne, déposer ici
`model-viewer.min.js` (Apache-2.0, ~950 Ko) :

```
curl -o models/model-viewer.min.js \
  https://ajax.googleapis.com/ajax/libs/model-viewer/4.0.0/model-viewer.min.js
```

Sans ce fichier, la 3D fonctionne uniquement en ligne ; le schéma prend le relais
le reste du temps.

## Clés d'exercice disponibles

```
board_pecs  board_standard  board_shoulders  board_triceps  archer  pike
pseudo  diamond  ab_wheel  jump_rope  bands  mat_plank  mat_splank
mat_mountain  mat_burpee  mat_crunch  mat_bicycle  mat_legraise  mat_superman
mat_glute  mat_russian  mat_hollow  mat_inchworm  mat_squat  mat_lunge
mat_wallsit  mat_calf  mat_jumpsquat  mac_bike  mac_elliptical  mac_treadmill
```
