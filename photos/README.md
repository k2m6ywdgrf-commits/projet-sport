# Photos du coach — départ / arrivée

Ce dossier reçoit **deux images par exercice** : la position de départ et la
position d'arrivée. Dès qu'une paire est déposée et déclarée, la fiche du
mouvement l'affiche à la place du schéma, avec un bouton pour revenir au schéma.

Tant qu'un exercice n'a pas ses photos, il garde son schéma vectoriel — qui
reste la seule source couvrant les 31 exercices, hors ligne et sans téléchargement.

## État actuel

**16 exercices illustrés**, **15 en attente**. Les 15 restants sont déjà
déclarés dans `index.html` (objet `PHOTO`) avec le nom de fichier exact qu'ils
doivent porter — **il n'y a plus aucune ligne de code à toucher**. Déposer un
fichier au bon nom dans ce dossier suffit à l'activer.

| Fait ✅ | En attente ⏳ |
|---|---|
| board_standard, board_pecs, board_triceps, board_shoulders | archer, pike, pseudo, diamond |
| mat_squat, mat_lunge, mat_wallsit | ab_wheel |
| mat_plank | mat_splank, mat_hollow |
| mat_crunch, mat_glute, mat_legraise, mat_russian, mat_superman | mat_bicycle, mat_burpee, mat_inchworm, mat_calf, mat_jumpsquat |
| mat_mountain | mac_bike, mac_elliptical, mac_treadmill |
| jump_rope, bands | |

## Noms de fichiers exacts (les 15 restants)

Convention : `{clé}_s.webp` pour le départ, `{clé}_e.webp` pour l'arrivée
(minuscules, underscore, pas d'accent). Pour les 3 positions tenues, un seul
fichier suffit (pas de `_e`).

| Clé | Départ | Arrivée |
|---|---|---|
| `archer` | `archer_s.webp` | `archer_e.webp` |
| `pike` | `pike_s.webp` | `pike_e.webp` |
| `pseudo` | `pseudo_s.webp` | `pseudo_e.webp` |
| `diamond` | `diamond_s.webp` | `diamond_e.webp` |
| `ab_wheel` | `ab_wheel_s.webp` | `ab_wheel_e.webp` |
| `mat_splank` | `mat_splank_s.webp` | *(position tenue, aucun fichier `_e`)* |
| `mat_burpee` | `mat_burpee_s.webp` | `mat_burpee_e.webp` |
| `mat_bicycle` | `mat_bicycle_s.webp` | `mat_bicycle_e.webp` |
| `mat_hollow` | `mat_hollow_s.webp` | *(position tenue, aucun fichier `_e`)* |
| `mat_inchworm` | `mat_inchworm_s.webp` | `mat_inchworm_e.webp` |
| `mat_calf` | `mat_calf_s.webp` | `mat_calf_e.webp` |
| `mat_jumpsquat` | `mat_jumpsquat_s.webp` | `mat_jumpsquat_e.webp` |
| `mac_bike` | `mac_bike_s.webp` | `mac_bike_e.webp` |
| `mac_elliptical` | `mac_elliptical_s.webp` | `mac_elliptical_e.webp` |
| `mac_treadmill` | `mac_treadmill_s.webp` | `mac_treadmill_e.webp` |

Un nom qui ne correspond pas exactement (majuscule, extension différente,
faute de frappe) ne fait planter rien — l'image ne charge simplement jamais et
la fiche reste sur son schéma, silencieusement.

## Taille de fichier

Pas de limite stricte, mais rester **dans le même ordre de grandeur que
l'existant** : les 30 images déjà en place pèsent entre 4 et 23 Ko chacune
(≈ 400 Ko au total pour 16 exercices). Objectif par image :

- **< 30 Ko** dans l'immense majorité des cas.
- **< 50 Ko** grand maximum, même pour un rendu détaillé (les images avec la
  planche push-up en arrière-plan, plus chargées visuellement, montent vers
  20-23 Ko).
- Format **WebP**, qualité ~85. Un PNG ou JPEG direct sans compression pèserait
  10 à 20 fois plus lourd pour un rendu identique à l'écran (l'app l'affiche
  à ~400 px de large maximum).

Si tu envoies des PNG non compressés, laisse-moi les convertir — c'est ce que
j'ai fait pour les 30 premières.

## Où les mettre sur GitHub, et comment

Le dossier est **`photos/`** à la racine du dépôt, sur la branche **`main`**
(c'est là que tout le travail précédent a été mergé).

**Méthode la plus simple — directement sur github.com, sans rien installer :**

1. Ouvrir le dépôt sur github.com, aller dans le dossier `photos/`.
2. Cliquer **Add file → Upload files** (bouton en haut à droite de la liste
   de fichiers).
3. Glisser les images — **en les renommant avant l'envoi** pour qu'elles
   correspondent exactement aux noms du tableau ci-dessus. Renommer un
   fichier sur son ordinateur (clic droit → renommer) avant de le glisser
   fonctionne très bien ; GitHub n'offre pas de renommage à l'upload.
4. En bas de page, choisir **« Commit directly to the `main` branch »**,
   puis **Commit changes**.
5. Recharger l'app (ou fermer/rouvrir si c'est une PWA installée) : la photo
   apparaît dans la fiche de l'exercice correspondant, plus besoin d'attendre
   personne.

Pas besoin de toucher à `index.html` ni de rien déclarer ailleurs : c'est déjà
fait pour ces 15 exercices.

## Le plus simple : depuis l'app

**Réglages → Coaching → 📷 CHARGER MES PHOTOS D'EXERCICES.**

La liste des 31 exercices s'affiche avec deux emplacements chacun (départ /
arrivée). On choisit une image depuis le téléphone, elle est redimensionnée à
900 px et convertie en WebP automatiquement, puis rangée dans le navigateur
(IndexedDB). Aucun fichier à déposer, aucune ligne de code.

Ces photos **restent sur l'appareil** : elles ne partent pas dans la synchro
cloud, qui ne transporte que des données de séance. Sur un second appareil, il
faut les recharger — ou passer par la méthode ci-dessous, qui les livre avec
l'app pour tout le monde.

## L'autre méthode : livrées avec l'app

C'est la section **« Où les mettre sur GitHub, et comment »** plus haut : pour
les 15 exercices restants, il n'y a plus qu'à déposer le fichier au bon nom
dans ce dossier, la déclaration existe déjà dans `index.html`.

Pour un exercice qui n'existe pas encore dans `PHOTO` (un futur 32ᵉ exercice,
par exemple), il faudrait l'y ajouter à la main, sur ce modèle :

```js
const PHOTO={
  mat_squat: {s:'mat_squat_s.webp', e:'mat_squat_e.webp'},
};
```

Si un fichier est absent ou illisible, la paire est retirée automatiquement et
la fiche retombe sur le schéma. Aucun trou possible dans l'affichage.

## Générer les images

Les rendus doivent montrer **le même personnage** d'une image à l'autre, sinon
l'app ressemble à un catalogue de mannequins différents. C'est le point
difficile : les générateurs d'images dérivent d'une image à l'autre.

**Méthode qui marche le mieux :** fournir l'image de référence en entrée
(*image de référence* / *character reference* / *img2img* selon l'outil) pour
chaque génération, et ne changer que la description de la pose.

### Description du personnage (à garder identique à chaque fois)

> Mannequin 3D masculin, musclé, peau blanc cassé lisse et mate. Tête chauve
> entièrement lisse, **sans visage**. Tee-shirt de sport bleu marine à manches
> raglan courtes, avec « COACH » écrit en lettres bâton gris clair sur la
> poitrine. Short de sport gris moyen, avec un cuissard de compression gris
> foncé dépassant sous l'ourlet. Manchons de compression gris aux mollets.
> Chaussures de running bleu marine à semelle blanche. Rendu 3D photoréaliste,
> éclairage doux venant du haut, ombre portée au sol discrète.

### Description de la pose (à changer)

Ajouter à la suite, par exemple :

- départ squat → *« debout, pieds largeur d'épaules, bras tendus devant à hauteur d'épaules, vu de profil »*
- arrivée squat → *« en squat profond, cuisses parallèles au sol, buste incliné vers l'avant, bras tendus devant, vu de profil »*

### Cadrage

- **Vue de profil** pour tout ce qui se juge sur la profondeur ou l'alignement :
  squats, fentes, pompes, planches, gainages, crunchs, chaise.
- **Vue de face** pour ce qui se juge sur la symétrie : écartés élastique,
  corde à sauter, jumping jacks, sauts.
- Personnage entier, centré, même distance de caméra d'une image à l'autre —
  sinon il change de taille entre départ et arrivée.

### Format

- **Fond transparent** de préférence (PNG ou WebP). Un fond bleu marine passera
  bien en thème sombre mais fera une tache en thème jour.
- Format portrait, ~800 × 1000 px suffit largement.
- Compresser en WebP qualité ~80 : viser < 80 Ko par image. À 62 images,
  ça reste sous 5 Mo au total.

## Les 31 exercices

| Clé | Vue | Départ | Arrivée |
|---|---|---|---|
| `board_pecs` | profil | planche haute, mains très écartées | poitrine près du sol, coudes à 45° |
| `board_standard` | profil | planche haute, mains largeur d'épaules | poitrine près du sol |
| `board_shoulders` | profil | bassin haut en V inversé | sommet du crâne près du sol |
| `board_triceps` | profil | planche haute, mains serrées | descente, coudes le long du corps |
| `archer` | profil | planche haute, bras très écartés | poids sur un bras, l'autre tendu |
| `pike` | profil | V inversé, jambes tendues | tête près du sol entre les mains |
| `pseudo` | profil | mains au niveau des hanches, buste penché | descente contrôlée |
| `diamond` | profil | mains en losange | poitrine vers les mains |
| `ab_wheel` | profil | à genoux, roue près des genoux | corps déroulé, bras tendus devant |
| `jump_rope` | face | debout, corde derrière les talons | en l'air, corde au-dessus de la tête |
| `bands` | face | bras tendus devant, élastique tendu | bras écartés en croix |
| `mat_plank` | profil | gainage sur avant-bras (une seule image suffit) | — |
| `mat_splank` | profil | gainage latéral (une seule image) | — |
| `mat_mountain` | profil | planche haute | un genou ramené sous la poitrine |
| `mat_burpee` | face/profil | debout | en planche, puis saut bras levés |
| `mat_crunch` | profil | allongé sur le dos, genoux fléchis | épaules décollées |
| `mat_bicycle` | profil | dos au sol, un genou ramené | jambes inversées |
| `mat_legraise` | profil | jambes tendues au sol | jambes à la verticale |
| `mat_superman` | profil | à plat ventre | bras et jambes décollés |
| `mat_glute` | profil | dos au sol, genoux fléchis | bassin levé, corps aligné |
| `mat_russian` | profil | assis, buste incliné en arrière | rotation du buste sur le côté |
| `mat_hollow` | profil | position banane tenue (une seule image) | — |
| `mat_inchworm` | profil | debout penché, mains au sol | planche haute |
| `mat_squat` | profil | debout, bras devant | squat profond |
| `mat_lunge` | profil | debout | fente, deux genoux à 90° |
| `mat_wallsit` | profil | chaise contre un mur (une seule image) | — |
| `mat_calf` | profil | debout à plat | sur la pointe des pieds |
| `mat_jumpsquat` | profil/face | squat bas | en l'air, bras levés |
| `mac_bike` | profil | assis sur un vélo d'appartement | pédale opposée en bas |
| `mac_elliptical` | profil | debout sur un elliptique, foulée avant | foulée inverse |
| `mac_treadmill` | profil | course sur tapis, appui avant | appui inverse |

Pour les quatre gainages tenus (`mat_plank`, `mat_splank`, `mat_hollow`,
`mat_wallsit`), une seule image suffit : déclarer uniquement `s`, sans `e`.
